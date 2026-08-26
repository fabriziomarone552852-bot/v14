"""Router HTTP del dominio Shopping (prefix /shopping)."""

from typing import List, Optional

from fastapi import APIRouter, Depends, Query, Response, status
from sqlalchemy.orm import Session

from backend.core import deps
from backend.domains.shopping import service
from backend.domains.shopping.schemas.groups import (
    ShoppingGroupCreate,
    ShoppingGroupMemberCreate,
    ShoppingGroupMemberInvite,
    ShoppingGroupMemberResponse,
    ShoppingGroupMemberRoleUpdate,
    ShoppingGroupResponse,
    ShoppingGroupUpdate,
)
from backend.domains.shopping.schemas.inventory import (
    InventoryBatchCreate,
    InventoryBatchResponse,
    InventoryBatchUpdate,
    ItemBatchResponse,
    CommunityPricePoint,
    QuickPriceBatchCreate,
)

from backend.domains.shopping.schemas.lists import (
    ShoppingListItemCreate,
    ShoppingListItemResponse,
    ShoppingListItemUpdate,
    ShoppingListCreate,
    ShoppingListResponse,
    ShoppingListUpdate,
)
from backend.domains.shopping.schemas.catalog import (
    ShoppingProductCreate,
    ShoppingProductResponse,
    ShoppingProductUpdate,
    ShoppingSupplierCreate,
    ShoppingSupplierResponse,
    ShoppingSupplierUpdate,
)
from backend.domains.shopping.schemas.config import ShoppingConfigBundle
from backend.domains.users.models import User

router = APIRouter(prefix="/shopping", tags=["shopping"])


@router.get("/groups", response_model=List[ShoppingGroupResponse])
def list_groups(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_app_user),
):
    return service.list_groups(db, current_user)


@router.post(
    "/groups",
    response_model=ShoppingGroupResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_group(
    group_in: ShoppingGroupCreate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_app_user),
):
    return service.create_group(db, current_user, group_in)


@router.patch("/groups/{group_id}", response_model=ShoppingGroupResponse)
def update_group(
    group_id: int,
    group_in: ShoppingGroupUpdate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_app_user),
):
    return service.update_group(db, current_user, group_id, group_in)


@router.delete(
    "/groups/{group_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    response_class=Response,
)
def delete_group(
    group_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_app_user),
):
    service.delete_group(db, current_user, group_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.post("/groups/{group_id}/archive", response_model=ShoppingGroupResponse)
def archive_group(
    group_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_app_user),
):
    return service.archive_group(db, current_user, group_id)


@router.post("/groups/{group_id}/unarchive", response_model=ShoppingGroupResponse)
def unarchive_group(
    group_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_app_user),
):
    return service.unarchive_group(db, current_user, group_id)



@router.get("/groups/{group_id}/members", response_model=List[ShoppingGroupMemberResponse])
def list_members(
    group_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_app_user),
):
    return service.list_members(db, current_user, group_id)


@router.post(
    "/groups/{group_id}/members",
    response_model=ShoppingGroupMemberResponse,
    status_code=status.HTTP_201_CREATED,
)
def add_member(
    group_id: int,
    member_in: ShoppingGroupMemberCreate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_app_user),
):
    return service.add_member(db, current_user, group_id, member_in)


@router.post(
    "/groups/{group_id}/invite",
    response_model=ShoppingGroupMemberResponse,
    status_code=status.HTTP_201_CREATED,
)
def invite_member(
    group_id: int,
    invite_in: ShoppingGroupMemberInvite,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_app_user),
):
    return service.invite_member(db, current_user, group_id, invite_in)


@router.patch("/groups/{group_id}/members/{user_id}", response_model=ShoppingGroupMemberResponse)
def update_member_role(
    group_id: int,
    user_id: int,
    role_in: ShoppingGroupMemberRoleUpdate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_app_user),
):
    return service.update_member_role(db, current_user, group_id, user_id, role_in)


@router.delete(
    "/groups/{group_id}/members/{user_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    response_class=Response,
)
def remove_member(
    group_id: int,
    user_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_app_user),
):
    service.remove_member(db, current_user, group_id, user_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.get("/lists", response_model=List[ShoppingListResponse])
def list_shopping_lists(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_app_user),
):
    return service.list_lists(db, current_user)


@router.post(
    "/lists",
    response_model=ShoppingListResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_shopping_list(
    list_in: ShoppingListCreate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_app_user),
):
    return service.create_list(db, current_user, list_in)


@router.patch("/lists/{list_id}", response_model=ShoppingListResponse)
def update_shopping_list(
    list_id: int,
    list_in: ShoppingListUpdate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_app_user),
):
    return service.update_list(db, current_user, list_id, list_in)


@router.delete(
    "/lists/{list_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    response_class=Response,
)
def delete_shopping_list(
    list_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_app_user),
):
    service.delete_list(db, current_user, list_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.get("/products", response_model=List[ShoppingProductResponse])
def list_products(
    search: Optional[str] = Query(None, min_length=1, max_length=255),
    brand_id: Optional[int] = Query(None),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_app_user),
):
    return service.list_products(db, search=search, brand_id=brand_id, limit=limit)


@router.post(
    "/products",
    response_model=ShoppingProductResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_product(
    product_in: ShoppingProductCreate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_app_user),
):
    return service.create_product(db, current_user, product_in)


@router.get("/products/{product_id}", response_model=ShoppingProductResponse)
def get_product(
    product_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_app_user),
):
    return service.get_product(db, current_user, product_id)


@router.patch("/products/{product_id}", response_model=ShoppingProductResponse)
def update_product(
    product_id: int,
    product_in: ShoppingProductUpdate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_app_user),
):
    return service.update_product(db, current_user, product_id, product_in)


@router.get("/items", response_model=List[ShoppingListItemResponse])
def list_shopping_items(
    is_purchased: Optional[bool] = Query(None),
    shopping_list_id: Optional[int] = Query(None),
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_app_user),
):
    return service.list_items(
        db=db,
        current_user=current_user,
        is_purchased=is_purchased,
        shopping_list_id=shopping_list_id,
    )


@router.post(
    "/items",
    response_model=ShoppingListItemResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_shopping_item(
    item_in: ShoppingListItemCreate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_app_user),
):
    return service.create_item(db, current_user, item_in)


@router.patch("/items/{item_id}", response_model=ShoppingListItemResponse)
def update_shopping_item(
    item_id: int,
    item_in: ShoppingListItemUpdate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_app_user),
):
    return service.update_item(db, current_user, item_id, item_in)


@router.delete(
    "/items/{item_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    response_class=Response,
)
def delete_shopping_item(
    item_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_app_user),
):
    service.delete_item(db, current_user, item_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.get("/config", response_model=ShoppingConfigBundle)
def get_shopping_config(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_app_user),
):
    return service.get_config_bundle(db)


@router.get("/suppliers", response_model=List[ShoppingSupplierResponse])
def list_suppliers(
    search: Optional[str] = Query(None, min_length=1, max_length=255),
    type_code: Optional[int] = Query(None, ge=1, le=3),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_app_user),
):
    return service.list_suppliers(db, current_user, search=search, type_code=type_code, limit=limit)


@router.get("/brands", response_model=List[ShoppingSupplierResponse])
def list_brands(
    search: Optional[str] = Query(None, min_length=1, max_length=255),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_app_user),
):
    return service.list_brands(db, current_user, search=search, limit=limit)


@router.post(
    "/suppliers",
    response_model=ShoppingSupplierResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_supplier(
    supplier_in: ShoppingSupplierCreate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_app_user),
):
    return service.create_supplier(db, current_user, supplier_in)


@router.patch("/suppliers/{supplier_id}", response_model=ShoppingSupplierResponse)
def update_supplier(
    supplier_id: int,
    supplier_in: ShoppingSupplierUpdate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_app_user),
):
    return service.update_supplier(db, current_user, supplier_id, supplier_in)


@router.delete(
    "/suppliers/{supplier_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    response_class=Response,
)
def delete_supplier(
    supplier_id: int,
    as_type: Optional[int] = Query(None, ge=1, le=2),
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_app_user),
):
    service.delete_supplier(db, current_user, supplier_id, as_type=as_type)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.get(
    "/inventory-batches",
    response_model=List[ItemBatchResponse],
)
def list_all_inventory_batches(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_app_user),
):
    return service.list_all_batches(db, current_user)


@router.post(
    "/inventory-batches/quick-add",
    response_model=List[ItemBatchResponse],
    status_code=status.HTTP_201_CREATED,
)
def create_quick_price_batch(
    batch_in: QuickPriceBatchCreate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_app_user),
):
    return service.create_quick_price_batch(db, current_user, batch_in)


@router.get(
    "/items/{item_id}/inventory-batches",
    response_model=List[ItemBatchResponse],
)
def list_item_batches(
    item_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_app_user),
):
    return service.list_item_batches(db, current_user, item_id)



@router.get(
    "/products/{product_id}/community-prices",
    response_model=List[CommunityPricePoint],
)
def list_community_prices(
    product_id: int,
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_app_user),
):
    return service.list_community_prices(db, product_id, limit=limit)


@router.post(
    "/items/{item_id}/inventory-batches",

    response_model=InventoryBatchResponse,
    status_code=status.HTTP_201_CREATED,
)
def add_inventory_batch(
    item_id: int,
    batch_in: InventoryBatchCreate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_app_user),
):
    return service.add_inventory_batch(db, current_user, item_id, batch_in)


@router.patch("/inventory-batches/{batch_id}", response_model=InventoryBatchResponse)
def update_inventory_batch(
    batch_id: int,
    batch_in: InventoryBatchUpdate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_app_user),
):
    return service.update_inventory_batch(db, current_user, batch_id, batch_in)


@router.delete(
    "/inventory-batches/{batch_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    response_class=Response,
)
def delete_inventory_batch(
    batch_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_app_user),
):
    service.delete_inventory_batch(db, current_user, batch_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)