package tsnetproxy

/*
#include <sys/types.h>
#include <sys/socket.h>
#include <ifaddrs.h>
#include <net/if.h>
#include <netinet/in.h>
#include <arpa/inet.h>
#include <stdlib.h>
#include <string.h>
*/
import "C"

import (
	"context"
	"fmt"
	"log"
	"net"
	"net/http"
	"net/http/httputil"
	"net/url"
	"os"
	"sync"
	"time"
	"unsafe"

	"tailscale.com/net/netmon"
	"tailscale.com/tsnet"
)

func fallbackInterfaces() []netmon.Interface {
	return []netmon.Interface{
		{
			Interface: &net.Interface{
				Index: 1,
				MTU:   1500,
				Name:  "lo",
				Flags: net.FlagUp | net.FlagLoopback,
			},
			AltAddrs: []net.Addr{
				&net.IPNet{IP: net.ParseIP("127.0.0.1"), Mask: net.CIDRMask(8, 32)},
				&net.IPNet{IP: net.ParseIP("::1"), Mask: net.CIDRMask(128, 128)},
			},
		},
		{
			Interface: &net.Interface{
				Index: 2,
				MTU:   1500,
				Name:  "wlan0",
				Flags: net.FlagUp | net.FlagBroadcast | net.FlagMulticast,
			},
			AltAddrs: []net.Addr{
				&net.IPNet{IP: net.ParseIP("10.0.0.2"), Mask: net.CIDRMask(24, 32)},
			},
		},
	}
}

// androidSafeInterfaces enumerates network interfaces via libc getifaddrs (safe on Android SELinux)
func androidSafeInterfaces() ([]netmon.Interface, error) {
	var ifap *C.struct_ifaddrs
	if ret := C.getifaddrs(&ifap); ret != 0 || ifap == nil {
		return fallbackInterfaces(), nil
	}
	defer C.freeifaddrs(ifap)

	ifMap := make(map[string]*netmon.Interface)
	index := 1

	for cur := ifap; cur != nil; cur = cur.ifa_next {
		if cur.ifa_name == nil || cur.ifa_addr == nil {
			continue
		}
		name := C.GoString(cur.ifa_name)

		iface, exists := ifMap[name]
		if !exists {
			flags := net.Flags(cur.ifa_flags)
			iface = &netmon.Interface{
				Interface: &net.Interface{
					Index: index,
					Name:  name,
					Flags: flags,
					MTU:   1500,
				},
				AltAddrs: []net.Addr{},
			}
			ifMap[name] = iface
			index++
		}

		family := cur.ifa_addr.sa_family
		if family == C.AF_INET {
			sa := (*C.struct_sockaddr_in)(unsafe.Pointer(cur.ifa_addr))
			ip := net.IPv4(
				byte(sa.sin_addr.s_addr&0xFF),
				byte((sa.sin_addr.s_addr>>8)&0xFF),
				byte((sa.sin_addr.s_addr>>16)&0xFF),
				byte((sa.sin_addr.s_addr>>24)&0xFF),
			)
			mask := net.CIDRMask(24, 32)
			if cur.ifa_netmask != nil {
				maskSa := (*C.struct_sockaddr_in)(unsafe.Pointer(cur.ifa_netmask))
				maskBytes := []byte{
					byte(maskSa.sin_addr.s_addr & 0xFF),
					byte((maskSa.sin_addr.s_addr >> 8) & 0xFF),
					byte((maskSa.sin_addr.s_addr >> 16) & 0xFF),
					byte((maskSa.sin_addr.s_addr >> 24) & 0xFF),
				}
				mask = net.IPMask(maskBytes)
			}
			iface.AltAddrs = append(iface.AltAddrs, &net.IPNet{IP: ip, Mask: mask})
		} else if family == C.AF_INET6 {
			sa := (*C.struct_sockaddr_in6)(unsafe.Pointer(cur.ifa_addr))
			ipBytes := C.GoBytes(unsafe.Pointer(&sa.sin6_addr), 16)
			ip := net.IP(ipBytes)
			mask := net.CIDRMask(64, 128)
			iface.AltAddrs = append(iface.AltAddrs, &net.IPNet{IP: ip, Mask: mask})
		}
	}

	result := make([]netmon.Interface, 0, len(ifMap))
	for _, iface := range ifMap {
		result = append(result, *iface)
	}

	if len(result) == 0 {
		return fallbackInterfaces(), nil
	}
	return result, nil
}

func init() {
	// Register safe libc interface getter to avoid netlinkrib permission denied on Android
	netmon.RegisterInterfaceGetter(androidSafeInterfaces)
}

// Callback interface for Android Java/Kotlin bridge
type Callback interface {
	OnAuthURL(authURL string)
	OnReady(localPort int)
	OnError(errMsg string)
	OnStatusChange(status string)
}

var (
	serverMu   sync.Mutex
	tsServer   *tsnet.Server
	httpServer *http.Server
	authURL    string
	isReady    bool
)

// Start initializes the tsnet server and starts a local reverse proxy
func Start(stateDir string, targetHost string, targetPort int, localPort int, cb Callback) {
	serverMu.Lock()
	defer serverMu.Unlock()

	if tsServer != nil {
		if cb != nil {
			if isReady {
				cb.OnReady(localPort)
			} else if authURL != "" {
				cb.OnAuthURL(authURL)
			}
		}
		return
	}

	if localPort <= 0 {
		localPort = 8088
	}

	if targetHost == "" {
		targetHost = "smartagenda.tailf3b58c.ts.net"
	}
	if targetPort <= 0 {
		targetPort = 8181
	}

	targetURL, err := url.Parse(fmt.Sprintf("http://%s:%d", targetHost, targetPort))
	if err != nil {
		if cb != nil {
			cb.OnError(fmt.Sprintf("Invalid target URL: %v", err))
		}
		return
	}

	// 1. Ensure state directory exists
	if err := os.MkdirAll(stateDir, 0700); err != nil {
		log.Printf("[tsnet] MkdirAll error on %s: %v", stateDir, err)
	}

	// 2. Set environment variables to prevent logpolicy/cache panics on Android
	os.Setenv("TS_LOGS_DIR", stateDir)
	os.Setenv("TMPDIR", stateDir)
	os.Setenv("HOME", stateDir)
	os.Setenv("XDG_CACHE_HOME", stateDir)
	os.Setenv("XDG_CONFIG_HOME", stateDir)
	os.Setenv("XDG_DATA_HOME", stateDir)

	if cb != nil {
		cb.OnStatusChange("Inizializzazione Tailscale...")
	}

	tsServer = &tsnet.Server{
		Hostname: "smartagenda-mobile",
		Dir:      stateDir,
		Logf: func(format string, args ...interface{}) {
			log.Printf("[tsnet] "+format, args...)
		},
		UserLogf: func(format string, args ...interface{}) {
			log.Printf("[tsnet-user] "+format, args...)
		},
	}

	go func() {
		defer func() {
			if r := recover(); r != nil {
				log.Printf("[tsnet] Recovered panic: %v", r)
				if cb != nil {
					cb.OnError(fmt.Sprintf("Panic recuperato: %v", r))
				}
			}
		}()

		// 1. Explicitly start the Tailscale engine in the background
		if err := tsServer.Start(); err != nil {
			log.Printf("[tsnet] Start error: %v", err)
			if cb != nil {
				cb.OnError(fmt.Sprintf("Errore avvio Tailscale: %v", err))
			}
			return
		}

		// 2. Monitor status and AuthURL in background
		go func() {
			defer func() {
				if r := recover(); r != nil {
					log.Printf("[tsnet] Recovered panic in monitor: %v", r)
				}
			}()

			lc, err := tsServer.LocalClient()
			if err != nil {
				log.Printf("[tsnet] LocalClient error: %v", err)
				return
			}

			lastAuthURL := ""
			for i := 0; i < 600; i++ {
				st, err := lc.Status(context.Background())
				if err == nil && st != nil {
					if st.AuthURL != "" && st.AuthURL != lastAuthURL {
						lastAuthURL = st.AuthURL
						serverMu.Lock()
						authURL = st.AuthURL
						serverMu.Unlock()
						log.Printf("[tsnet] AuthURL generated: %s", st.AuthURL)
						if cb != nil {
							cb.OnAuthURL(st.AuthURL)
						}
					}

					if st.BackendState == "NeedsLogin" {
						if cb != nil && lastAuthURL != "" {
							cb.OnStatusChange("In attesa di login nel browser...")
						}
					} else if st.BackendState == "Running" {
						log.Printf("[tsnet] Backend is Running!")
						if cb != nil {
							cb.OnStatusChange("Tailscale Connesso! Avvio Proxy...")
						}
						break
					} else if st.BackendState != "" {
						if cb != nil && lastAuthURL == "" {
							cb.OnStatusChange(fmt.Sprintf("Stato rete: %s", st.BackendState))
						}
					}
				}
				time.Sleep(500 * time.Millisecond)
			}
		}()

		if cb != nil {
			cb.OnStatusChange("Connessione a Tailscale in corso...")
		}

		ctx, cancel := context.WithTimeout(context.Background(), 300*time.Second)
		defer cancel()

		status, err := tsServer.Up(ctx)
		if err != nil {
			log.Printf("[tsnet] Up error: %v", err)
			if cb != nil {
				cb.OnError(fmt.Sprintf("Tailscale Up error: %v", err))
			}
			return
		}

		log.Printf("[tsnet] Tailscale Up! Local IP: %v", status.TailscaleIPs)
		if cb != nil {
			cb.OnStatusChange("Tailscale Connesso! Avvio Proxy...")
		}

		// Configure reverse proxy to route through tsnet
		proxy := httputil.NewSingleHostReverseProxy(targetURL)
		proxy.Transport = &http.Transport{
			DialContext: func(ctx context.Context, network, addr string) (net.Conn, error) {
				return tsServer.Dial(ctx, network, addr)
			},
		}

		handler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			r.Host = targetURL.Host
			r.Header.Set("X-Forwarded-Host", r.Host)
			proxy.ServeHTTP(w, r)
		})

		listenAddr := fmt.Sprintf("127.0.0.1:%d", localPort)
		listener, err := net.Listen("tcp", listenAddr)
		if err != nil {
			log.Printf("[tsnet] Local listen error on %s: %v", listenAddr, err)
			if cb != nil {
				cb.OnError(fmt.Sprintf("Local listen error: %v", err))
			}
			return
		}

		serverMu.Lock()
		isReady = true
		httpServer = &http.Server{
			Handler: handler,
		}
		serverMu.Unlock()

		log.Printf("[tsnet] Proxy pronto su http://%s -> %s", listenAddr, targetURL.String())
		if cb != nil {
			cb.OnReady(localPort)
		}

		if err := httpServer.Serve(listener); err != nil && err != http.ErrServerClosed {
			log.Printf("[tsnet] Proxy Serve error: %v", err)
			if cb != nil {
				cb.OnError(fmt.Sprintf("Proxy server error: %v", err))
			}
		}
	}()
}

// GetAuthURL returns the pending Tailscale auth URL if any
func GetAuthURL() string {
	serverMu.Lock()
	defer serverMu.Unlock()
	return authURL
}

// IsReady returns true if Tailscale is connected and proxy is serving
func IsReady() bool {
	serverMu.Lock()
	defer serverMu.Unlock()
	return isReady
}

// Stop closes the tsnet server and HTTP proxy
func Stop() {
	serverMu.Lock()
	defer serverMu.Unlock()

	if httpServer != nil {
		ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
		defer cancel()
		_ = httpServer.Shutdown(ctx)
		httpServer = nil
	}

	if tsServer != nil {
		_ = tsServer.Close()
		tsServer = nil
	}

	authURL = ""
	isReady = false
}
