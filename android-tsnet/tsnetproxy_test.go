package tsnetproxy

import (
	"os"
	"testing"
	"time"

	"tailscale.com/net/netmon"
)

type testCb struct{}

func (t *testCb) OnAuthURL(u string)     {}
func (t *testCb) OnReady(p int)          {}
func (t *testCb) OnError(e string)        {}
func (t *testCb) OnStatusChange(s string) {}

func TestNetmonState(t *testing.T) {
	st, err := netmon.GetState()
	if err != nil {
		t.Fatalf("GetState failed: %v", err)
	}
	t.Logf("State: %+v", st)
}

func TestStartTsnet(t *testing.T) {
	dir, err := os.MkdirTemp("", "tsnet-test-*")
	if err != nil {
		t.Fatal(err)
	}
	defer os.RemoveAll(dir)

	Start(dir, "smartagenda.tailf3b58c.ts.net", 8181, 8089, &testCb{})
	time.Sleep(2 * time.Second)
	Stop()
}
