# Database Schema Specification (DSS)

## Version 1.0

**Project:** TKS Iyengar's Catering Management System\
**Source of Truth:** Approved Backend Functional Specification (BFS)
v1.0\
**Backend Platform:** Supabase\
**Backend Development Language:** TypeScript\
**Database:** Supabase PostgreSQL

------------------------------------------------------------------------

# Chapter 1 -- Purpose and Scope

## 1.1 Purpose

This Database Schema Specification translates the approved Backend
Functional Specification (BFS) v1.0 into a relational database design.

The DSS defines:

-   Database entities and their responsibilities.
-   Attributes and data types.
-   Primary and foreign keys.
-   Relationships and cardinality.
-   Constraints and validation rules.
-   Historical snapshots required by the BFS.
-   Order status and pricing representation.
-   Invoice persistence and historical accuracy.
-   Data integrity requirements.

The DSS is strictly subordinate to the approved BFS. It does not
introduce additional business workflows, user roles, or product
features.

## 1.2 Design Principles

1.  Supabase PostgreSQL is the central source of truth for submitted and
    managed business records.
2.  Customer accounts are not part of the system.
3.  The customer browser/device maintains local submitted-enquiry
    snapshots and drafts; these are not database substitutes.
4.  Online and manual enquiries/orders are represented consistently.
5.  Historical order item names and prices are preserved independently
    of the current menu.
6.  Previously generated invoices retain their original content.
7.  Confirmed-order edits and confirmed-order cancellations retain their
    reasons.
8.  The database supports one administrator/manager account for Version
    1.
9.  The schema must support the order and invoice numbering formats
    established in the BFS.
10. Every table and relationship exists to satisfy an explicit BFS
    requirement.

## 1.3 Naming Conventions

-   Table names: plural, `snake_case`.
-   Column names: `snake_case`.
-   Primary keys: `id`.
-   Foreign keys: `<referenced_entity>_id`.
-   Monetary values: `numeric(12,2)`.
-   Timestamps: `timestamptz`.
-   Business dates: `date`.
-   Generated business identifiers: stored separately from internal
    primary keys.

------------------------------------------------------------------------

# Chapter 2 -- Entity Overview

The Version 1 relational model contains the following entities.

  -----------------------------------------------------------------------
  Entity                              Purpose
  ----------------------------------- -----------------------------------
  `admin_users`                       Identifies the single
                                      administrator/manager account.

  `business_settings`                 Stores the catering business
                                      details used on invoices.

  `customers`                         Stores customer identity and
                                      contact information.

  `catering_records`                  Stores online enquiries and
                                      manually created enquiries/orders
                                      in a unified lifecycle.

  `catering_record_items`             Stores the item and price snapshot
                                      associated with each catering
                                      record.

  `record_change_reasons`             Stores reasons for edits to
                                      confirmed orders and cancellations
                                      of confirmed orders.

  `menu_categories`                   Stores configurable food
                                      categories.

  `menu_items`                        Stores catalogue food items and
                                      current menu prices.

  `feasts`                            Stores curated predefined feast
                                      packages and occasion tags.

  `feast_items`                       Associates menu items with predefined
                                      feasts.

  `invoices`                          Stores generated invoice identity,
                                      status-independent historical
                                      invoice data, and totals.

  `invoice_items`                     Stores the itemized snapshot
                                      printed on each generated invoice.
  -----------------------------------------------------------------------

Customer-side drafts and original submitted-history copies are
browser/device-local data and are not represented as server-side
customer accounts or draft tables.

------------------------------------------------------------------------

# Chapter 3 -- Relationship Overview

## 3.1 Entity Relationships

  ------------------------------------------------------------------------------------
  Parent               Child                     Relationship      Description
  -------------------- ------------------------- ----------------- -------------------
  `customers`          `catering_records`        One-to-many       A customer can have
                                                                   multiple
                                                                   enquiries/orders.

  `catering_records`   `catering_record_items`   One-to-many       A record can
                                                                   contain multiple
                                                                   selected food
                                                                   items.

  `menu_categories`    `menu_items`              One-to-many       A category can
                                                                   contain multiple
                                                                   menu items.

  `feasts`             `feast_items`             One-to-many       A predefined feast
                                                                   contains curated
                                                                   dishes.

  `menu_items`         `feast_items`             One-to-many       A menu item can
                                                                   appear across
                                                                   multiple feasts.

  `menu_items`         `catering_record_items`   One-to-many,      A record item may
                                                 optional          refer to its
                                                 reference         current menu item
                                                                   while preserving
                                                                   its own snapshot.

  `catering_records`   `record_change_reasons`   One-to-many       A record can have
                                                                   multiple recorded
                                                                   edit/cancellation
                                                                   reasons.

  `catering_records`   `invoices`                One-to-many       A confirmed order
                                                                   can have generated
                                                                   invoice versions
                                                                   over time.

  `invoices`           `invoice_items`           One-to-many       An invoice contains
                                                                   one or more
                                                                   itemized food rows.

  `admin_users`        Administrative records    One-to-many or    Records the manager
                                                 optional audit    responsible for an
                                                 reference         administrative
                                                                   action where
                                                                   applicable.
  ------------------------------------------------------------------------------------

## 3.2 Relationship Rules

-   A catering record must be associated with a customer.
-   A catering record can contain zero or more item rows while it is an
    incomplete general enquiry.
-   A record must have the required food selection and order details
    before confirmation.
-   A catering record item preserves the item name and price
    independently of the menu item.
-   An invoice belongs to one catering record.
-   An invoice contains its own item and pricing snapshots.
-   A menu item may be removed from the active catalogue without
    deleting historical record-item or invoice-item snapshots.

------------------------------------------------------------------------

# Chapter 4 -- Data Types and Enumerations

## 4.1 Record Source

`record_source`

  Value      Meaning
  ---------- -------------------------------------------------------
  `ONLINE`   Submitted by a customer through the public catalogue.
  `MANUAL`   Created by the manager.

## 4.2 Catering Record Status

`record_status`

  -----------------------------------------------------------------------
  Value                               Meaning
  ----------------------------------- -----------------------------------
  `NEW_REQUEST`                       Newly submitted online enquiry
                                      awaiting manager attention.

  `UNDER_DISCUSSION`                  Requirements or pricing are being
                                      discussed.

  `CONFIRMED`                         Customer and business have agreed
                                      and the manager has confirmed the
                                      order.

  `COMPLETED`                         Catering event/order has been
                                      fulfilled.

  `CANCELLED`                         Enquiry/order has been cancelled.
  -----------------------------------------------------------------------

The `NEW_REQUEST` status is used for incoming online submissions. Manual
creation starts as `UNDER_DISCUSSION` or `CONFIRMED`.

## 4.3 Record Change Reason Type

`record_change_reason_type`

  -----------------------------------------------------------------------
  Value                               Meaning
  ----------------------------------- -----------------------------------
  `CONFIRMED_ORDER_EDIT`              Reason for editing a confirmed
                                      order.

  `CONFIRMED_ORDER_CANCELLATION`      Reason for cancelling a confirmed
                                      order.
  -----------------------------------------------------------------------

## 4.4 Availability

`availability_status`

  Value           Meaning
  --------------- --------------------------------------
  `AVAILABLE`     Item can be selected by customers.
  `UNAVAILABLE`   Item is not selectable by customers.

## 4.5 Invoice Numbering

Invoice numbers follow:

`TKS-INV-YYYY-0001`

## 4.6 Order Numbering

Order identifiers follow:

`TKS-ORD-YYYY-0001`

Order identifiers and invoice numbers are separate sequences. Each
sequence resets with the year.

------------------------------------------------------------------------

# Chapter 5 -- Table Specifications

## 5.1 `admin_users`

### Purpose

Stores the administrator/manager identity for the single-account Version
1 administration system.

Authentication credentials are managed by Supabase Auth. This table
stores the corresponding application-level user identity, not passwords.

  ------------------------------------------------------------------------
  Column            Type              Constraints        Description
  ----------------- ----------------- ------------------ -----------------
  `id`              `uuid`            PK; references     Supabase Auth
                                      `auth.users(id)`   user identifier.

  `display_name`    `text`            NOT NULL           Manager display
                                                         name.

  `created_at`      `timestamptz`     NOT NULL; default  Record creation
                                      `now()`            time.

  `updated_at`      `timestamptz`     NOT NULL; default  Last update time.
                                      `now()`            
  ------------------------------------------------------------------------

### Rules

-   Version 1 supports one administrator/manager account.
-   No staff-role hierarchy or multiple permission levels are defined.

------------------------------------------------------------------------

## 5.2 `business_settings`

### Purpose

Stores the catering business profile configured through Admin Settings
and automatically displayed on invoices.

Version 1 uses one business settings record.

  ---------------------------------------------------------------------------
  Column            Type              Constraints           Description
  ----------------- ----------------- --------------------- -----------------
  `id`              `uuid`            PK; default           Internal
                                      `gen_random_uuid()`   identifier.

  `business_name`   `text`            NOT NULL              Catering business
                                                            name.

  `logo_path`       `text`            NULL allowed          Stored logo asset
                                                            reference.

  `address`         `text`            NOT NULL              Business address.

  `phone_number`    `text`            NOT NULL              Business phone
                                                            number.

  `gstin`           `text`            NOT NULL              Business GSTIN.

  `created_at`      `timestamptz`     NOT NULL; default     Creation time.
                                      `now()`               

  `updated_at`      `timestamptz`     NOT NULL; default     Last update time.
                                      `now()`               
  ---------------------------------------------------------------------------

### Rules

-   Only one active business settings record is required for Version 1.
-   The configured values are used when generating invoices.
-   Invoice generation copies the applicable business details into the
    invoice snapshot so later settings changes do not rewrite previously
    generated invoices.

------------------------------------------------------------------------

## 5.3 `customers`

### Purpose

Stores customer information and supports recognition of returning
customers by mobile number.

  --------------------------------------------------------------------------------
  Column                 Type              Constraints           Description
  ---------------------- ----------------- --------------------- -----------------
  `id`                   `uuid`            PK; default           Internal customer
                                           `gen_random_uuid()`   identifier.

  `name`                 `text`            NOT NULL              Customer name.

  `mobile_number`        `text`            NOT NULL; UNIQUE      Customer mobile
                                                                 number used for
                                                                 recognition.

  `address`              `text`            NULL allowed          Customer address,
                                                                 where available.

  `notes`                `text`            NULL allowed          Manager CRM notes on
                                                                 customer preferences.

  `first_contacted_at`   `timestamptz`     NOT NULL; default     First recorded
                                           `now()`               interaction.

  `last_contacted_at`    `timestamptz`     NOT NULL; default     Most recent
                                           `now()`               recorded
                                                                 interaction.

  `created_at`           `timestamptz`     NOT NULL; default     Record creation
                                           `now()`               time.

  `updated_at`           `timestamptz`     NOT NULL; default     Last update time.
                                           `now()`               
  --------------------------------------------------------------------------------

### Rules

-   A matching mobile number identifies a returning customer.
-   Mobile numbers are strictly standardized (cleaned of whitespace, hyphens, and leading zero/international prefixes to a canonical 10-digit format) before matching or inserting (`CHECK (mobile_number ~ '^\+?[0-9]{10,13}$')`).
-   A new enquiry/order using an existing mobile number is associated
    with the existing customer record.
-   General CRM notes are stored directly on the customer record.
-   A separate standalone customer-creation workflow is not required.
-   Customer history is obtained through related catering records.
-   General enquiries are retained as catering records and are therefore
    visible in customer history.

------------------------------------------------------------------------

## 5.4 `menu_categories`

### Purpose

Stores the configurable categories displayed in the public catalogue.

  ---------------------------------------------------------------------------
  Column            Type              Constraints           Description
  ----------------- ----------------- --------------------- -----------------
  `id`              `uuid`            PK; default           Category
                                      `gen_random_uuid()`   identifier.

  `name`            `text`            NOT NULL              Category name.

  `display_order`   `integer`         NOT NULL; default `0` Category display
                                                            order.

  `created_at`      `timestamptz`     NOT NULL; default     Creation time.
                                      `now()`               

  `updated_at`      `timestamptz`     NOT NULL; default     Last update time.
                                      `now()`               
  ---------------------------------------------------------------------------

### Rules

-   Category names can be edited.
-   Categories can be reordered.
-   Categories can be removed.
-   Categories are configurable and are not restricted to a predefined
    list.
-   Historical order item snapshots must remain intact if a category is
    removed.

------------------------------------------------------------------------

## 5.5 `menu_items`

### Purpose

Stores the current catalogue items and their current per-plate prices.

  -------------------------------------------------------------------------------------
  Column              Type                    Constraints             Description
  ------------------- ----------------------- ----------------------- -----------------
  `id`                `uuid`                  PK; default             Menu item
                                              `gen_random_uuid()`     identifier.

  `category_id`       `uuid`                  FK to                   Current category.
                                              `menu_categories(id)`   

  `name`              `text`                  NOT NULL                Item name.

  `price_per_plate`   `numeric(12,2)`         NOT NULL; CHECK `>= 0`  Current per-plate
                                                                      price.

  `image_path`        `text`                  NULL allowed            Stored image
                                                                      asset reference.

  `availability`      `availability_status`   NOT NULL; default       Whether customers
                                              `AVAILABLE`             can select the
                                                                      item.

  `created_at`        `timestamptz`           NOT NULL; default       Creation time.
                                              `now()`                 

  `updated_at`        `timestamptz`           NOT NULL; default       Last update time.
                                              `now()`                 
  -------------------------------------------------------------------------------------

### Rules

-   An item belongs to a category while it is in the active catalogue.
-   The manager can update its name, price, image, category, and
    availability.
-   Unavailable items are excluded from customer selection.
-   Removing an item from the active menu must not delete historical
    order-item or invoice-item snapshots.
-   The current menu price is used for new selections and new manual
    records.

------------------------------------------------------------------------

## 5.6 `catering_records`

### Purpose

This is the central business record table for online enquiries and
manually created enquiries/orders.

It represents the unified enquiry/order lifecycle described in the BFS.

  ---------------------------------------------------------------------------------------
  Column                    Type              Constraints           Description
  ------------------------- ----------------- --------------------- ---------------------
  `id`                      `uuid`            PK; default           Internal record
                                              `gen_random_uuid()`   identifier.

  `order_number`            `text`            UNIQUE; NOT NULL      Business identifier
                                                                    in
                                                                    `TKS-ORD-YYYY-0001`
                                                                    format (assigned on creation).

  `customer_id`             `uuid`            FK to                 Associated customer.
                                              `customers(id)`; NOT  
                                              NULL                  

  `source`                  `record_source`   NOT NULL              Online or Manual.

  `status`                  `record_status`   NOT NULL              Current lifecycle
                                                                    status.

  `occasion_type`           `text`            NULL allowed while    Occasion type.
                                              incomplete            

  `occasion_date`           `date`            NULL allowed while    Occasion date.
                                              incomplete            

  `service_time`            `text`            NULL allowed          Service time, where
                                                                    entered.

  `plate_count`             `integer`         NULL allowed while    Number of
                                              incomplete; CHECK     plates/meals.
                                              when present `> 0`    

  `delivery_address`        `text`            NULL allowed while    Event delivery
                                              incomplete            address.

  `special_instructions`    `text`            NULL allowed          Customer's
                                                                    original/requested
                                                                    special instructions
                                                                    as currently
                                                                    recorded.

  `enquiry_notes`           `text`            NULL allowed          Manager's enquiry
                                                                    notes.

  `food_subtotal`           `numeric(12,2)`   NOT NULL; default     Current food
                                              `0`; CHECK `>= 0`     subtotal.

  `delivery_charges`        `numeric(12,2)`   NOT NULL; default     Delivery charges.
                                              `0`; CHECK `>= 0`     

  `customization_charges`   `numeric(12,2)`   NOT NULL; default     Customization
                                              `0`; CHECK `>= 0`     charges.

  `gst_base_amount`         `numeric(12,2)`   NOT NULL; default     Aggregate amount on
                                              `0`; CHECK `>= 0`     which GST is calculated.

  `gst_rate`                `numeric(5,2)`    NOT NULL; default     GST percentage for
                                              `5.00`                the record.

  `gst_amount`              `numeric(12,2)`   NOT NULL; default     Calculated GST
                                              `0`; CHECK `>= 0`     amount.

  `final_amount`            `numeric(12,2)`   NOT NULL; default     Final calculated
                                              `0`; CHECK `>= 0`     amount.

  `final_instructions`      `text`            NULL allowed          Manager-entered final
                                                                    fulfilment
                                                                    instructions.

  `confirmed_at`            `timestamptz`     NULL allowed          Time of confirmation.

  `completed_at`            `timestamptz`     NULL allowed          Time marked
                                                                    completed.

  `cancelled_at`            `timestamptz`     NULL allowed          Time cancelled.

  `created_at`              `timestamptz`     NOT NULL; default     Record creation time.
                                              `now()`               

  `updated_at`              `timestamptz`     NOT NULL; default     Last update time.
                                              `now()`               
  ---------------------------------------------------------------------------------------

### Rules

1.  `source` is `ONLINE` for public customer submissions and `MANUAL`
    for manager-created records.
2.  An online submission is created with `NEW_REQUEST`.
3.  A manual record is created with either `UNDER_DISCUSSION` or
    `CONFIRMED`.
4.  An incomplete general enquiry may have null occasion, plate
    quantity, or item rows while it remains under discussion.
5.  A record must have the required customer, occasion, menu, quantity,
    and pricing information before confirmation.
6.  `order_number` follows `TKS-ORD-YYYY-0001` and is unique.
7.  The order-number sequence is separate from invoice numbering and
    resets by year.
8.  Confirmed-order edits require a corresponding reason record.
9.  Confirmed-order cancellation requires a corresponding cancellation
    reason.
10. `final_instructions` is visible in the manager's order view and is
    included in generated invoices when present.
11. Completed and cancelled records remain stored and accessible.
12. The dashboard calendar counts records with `CONFIRMED` status for
    their occasion date only.
13. New Requests is the manager-facing view of online records with
    `NEW_REQUEST` status.
14. Active Orders is the manager-facing view of records in
    `UNDER_DISCUSSION` and `CONFIRMED` states.
15. All Orders includes online and manual records across statuses.

------------------------------------------------------------------------

## 5.7 `catering_record_items`

### Purpose

Stores the food items selected for a catering record, including the item
name and price snapshot required to preserve historical order accuracy.

  ------------------------------------------------------------------------------------------
  Column                       Type              Constraints               Description
  ---------------------------- ----------------- ------------------------- -----------------
  `id`                         `uuid`            PK; default               Record-item
                                                 `gen_random_uuid()`       identifier.

  `catering_record_id`         `uuid`            FK to                     Parent catering
                                                 `catering_records(id)`;   record.
                                                 NOT NULL                  

  `menu_item_id`               `uuid`            FK to `menu_items(id)`;   Current menu item
                                                 NULL allowed              reference, if it
                                                                           still exists.

  `item_name_snapshot`         `text`            NOT NULL                  Item name
                                                                           applicable to
                                                                           this record.

  `price_per_plate_snapshot`   `numeric(12,2)`   NOT NULL; CHECK `>= 0`    Per-plate price
                                                                           applicable to
                                                                           this record.

  `plate_count`                `integer`         NOT NULL; CHECK `> 0`     Number of plates
                                                                           for this item.

  `line_amount`                `numeric(12,2)`   NOT NULL; CHECK `>= 0`    Item price
                                                                           multiplied by
                                                                           plate count.

  `created_at`                 `timestamptz`     NOT NULL; default `now()` Creation time.

  `updated_at`                 `timestamptz`     NOT NULL; default `now()` Last update time.
  ------------------------------------------------------------------------------------------

### Rules

-   Each row belongs to one catering record.
-   The item name and price are stored as snapshots.
-   `menu_item_id` is a reference to the current menu item, not the
    source of historical pricing.
-   If the menu item is removed, the snapshot remains valid.
-   `line_amount = price_per_plate_snapshot × plate_count`.
-   `food_subtotal` on the parent record equals the sum of its item
    `line_amount` values.
-   Changes to a confirmed order's items require a reason in
    `record_change_reasons`.

------------------------------------------------------------------------

## 5.8 `record_change_reasons`

### Purpose

Stores mandatory reasons for confirmed-order edits and confirmed-order
cancellations.

  -------------------------------------------------------------------------------------------------
  Column                 Type                          Constraints               Description
  ---------------------- ----------------------------- ------------------------- ------------------
  `id`                   `uuid`                        PK; default               Reason record
                                                       `gen_random_uuid()`       identifier.

  `catering_record_id`   `uuid`                        FK to                     Related catering
                                                       `catering_records(id)`;   record.
                                                       NOT NULL                  

  `reason_type`          `record_change_reason_type`   NOT NULL                  Edit or
                                                                                 confirmed-order
                                                                                 cancellation.

  `reason`               `text`                        NOT NULL; non-empty after Manager-provided
                                                       trimming                  reason.

  `change_diff`          `jsonb`                       NULL allowed              Structured snapshot
                                                                                 of modified fields,
                                                                                 previous values vs
                                                                                 new values.

  `created_by`           `uuid`                        FK to `admin_users(id)`;  Manager who
                                                       NULL allowed              supplied the
                                                                                 reason.

  `created_at`           `timestamptz`                 NOT NULL; default `now()` Time the reason
                                                                                 was recorded.
  -------------------------------------------------------------------------------------------------

### Rules

-   Every edit to a confirmed order must have a `CONFIRMED_ORDER_EDIT`
    reason.
-   Cancellation of a confirmed order must have a
    `CONFIRMED_ORDER_CANCELLATION` reason.
-   A reason cannot consist only of whitespace.
-   The reason is retained as part of the order's historical record.

------------------------------------------------------------------------

## 5.9 `invoices`

### Purpose

Stores each generated invoice and its historical business, customer,
event, and pricing information.

A confirmed order can have more than one generated invoice over time,
for example when the manager regenerates an invoice after an order edit.

  -------------------------------------------------------------------------------------------------
  Column                          Type              Constraints               Description
  ------------------------------- ----------------- ------------------------- ---------------------
  `id`                            `uuid`            PK; default               Internal invoice
                                                    `gen_random_uuid()`       identifier.

  `catering_record_id`            `uuid`            FK to                     Related confirmed
                                                    `catering_records(id)`;   order.
                                                    NOT NULL                  

  `invoice_number`                `text`            UNIQUE; NOT NULL          Identifier in
                                                                              `TKS-INV-YYYY-0001`
                                                                              format.

  `invoice_date`                  `date`            NOT NULL                  Invoice issue date.

  `business_name_snapshot`        `text`            NOT NULL                  Business name printed
                                                                              on this invoice.

  `business_logo_path_snapshot`   `text`            NULL allowed              Logo reference used
                                                                              for this invoice.

  `business_address_snapshot`     `text`            NOT NULL                  Business address
                                                                              printed on this
                                                                              invoice.

  `business_phone_snapshot`       `text`            NOT NULL                  Business phone
                                                                              printed on this
                                                                              invoice.

  `business_gstin_snapshot`       `text`            NOT NULL                  GSTIN printed on this
                                                                              invoice.

  `customer_name_snapshot`        `text`            NOT NULL                  Customer name printed
                                                                              on this invoice.

  `customer_mobile_snapshot`      `text`            NOT NULL                  Customer mobile
                                                                              printed on this
                                                                              invoice.

  `customer_address_snapshot`     `text`            NOT NULL                  Customer address
                                                                              printed on this
                                                                              invoice.

  `occasion_type_snapshot`        `text`            NOT NULL                  Occasion/event
                                                                              information printed
                                                                              on this invoice.

  `occasion_date_snapshot`        `date`            NOT NULL                  Occasion date printed
                                                                              on this invoice.

  `service_time_snapshot`         `text`            NULL allowed              Service time, where
                                                                              entered.

  `plate_count_snapshot`          `integer`         NOT NULL; CHECK `> 0`     Plate quantity
                                                                              printed on this
                                                                              invoice.

  `food_subtotal`                 `numeric(12,2)`   NOT NULL; CHECK `>= 0`    Food subtotal.

  `delivery_charges`              `numeric(12,2)`   NOT NULL; CHECK `>= 0`    Delivery charges.

  `customization_charges`         `numeric(12,2)`   NOT NULL; CHECK `>= 0`    Customization
                                                                              charges.

  `gst_rate`                      `numeric(5,2)`    NOT NULL; default `5.00`  GST percentage
                                                                              applied.

  `gst_base_amount`               `numeric(12,2)`   NOT NULL; CHECK `>= 0`    Aggregate amount on
                                                                              which GST is
                                                                              calculated.

  `gst_amount`                    `numeric(12,2)`   NOT NULL; CHECK `>= 0`    GST amount.

  `final_amount`                  `numeric(12,2)`   NOT NULL; CHECK `>= 0`    Final invoice amount.

  `final_instructions_snapshot`   `text`            NULL allowed              Final instructions
                                                                              printed on the
                                                                              invoice, if present.

  `pdf_storage_path`              `text`            NULL allowed              Generated PDF storage
                                                                              reference.

  `created_at`                    `timestamptz`     NOT NULL; default `now()` Invoice generation
                                                                              time.
  -------------------------------------------------------------------------------------------------

### Rules

1.  An invoice can only be generated for a catering record in
    `CONFIRMED` status.
2.  Invoice numbers follow `TKS-INV-YYYY-0001`.
3.  Invoice numbering is separate from order numbering and resets with
    the year.
4.  Each invoice stores a snapshot of the business settings used at
    generation time.
5.  Each invoice stores a snapshot of customer and event details.
6.  Each invoice stores its own item rows in `invoice_items`.
7.  Each invoice preserves its original pricing values.
8.  Later changes to business settings, customer details, menu data, or
    the catering record must not silently rewrite an existing invoice.
9.  Regenerating an invoice creates a new invoice record with a new
    invoice number and a fresh snapshot of the current confirmed order.
10. The previously generated invoice remains historically identifiable.
11. The invoice PDF can be downloaded and shared using native device
    sharing.
12. If final instructions are absent, the invoice does not display an
    empty final-instructions section.

------------------------------------------------------------------------

## 5.10 `invoice_items`

### Purpose

Stores the itemized food rows printed on a particular invoice.

  --------------------------------------------------------------------------------------
  Column                       Type              Constraints           Description
  ---------------------------- ----------------- --------------------- -----------------
  `id`                         `uuid`            PK; default           Invoice item
                                                 `gen_random_uuid()`   identifier.

  `invoice_id`                 `uuid`            FK to `invoices(id)`; Parent invoice.
                                                 NOT NULL              

  `item_name_snapshot`         `text`            NOT NULL              Item name printed
                                                                       on invoice.

  `price_per_plate_snapshot`   `numeric(12,2)`   NOT NULL; CHECK       Per-plate price
                                                 `>= 0`                printed on
                                                                       invoice.

  `plate_count`                `integer`         NOT NULL; CHECK `> 0` Number of plates.

  `line_amount`                `numeric(12,2)`   NOT NULL; CHECK       Item amount
                                                 `>= 0`                printed on
                                                                       invoice.
  --------------------------------------------------------------------------------------

### Rules

-   Each invoice item belongs to exactly one invoice.
-   Invoice item values are snapshots.
-   Invoice item values must not be dynamically read from the current
    menu.
-   `line_amount = price_per_plate_snapshot × plate_count`.
-   The sum of invoice item `line_amount` values equals the invoice
    `food_subtotal`.

------------------------------------------------------------------------

## 5.11 `feasts`

### Purpose

Stores the predefined curated feast packages configured by the manager
and displayed in the public catalogue for 1-tap booking.

  ----------------------------------------------------------------------------------
  Column            Type              Constraints               Description
  ----------------- ----------------- ------------------------- --------------------
  `id`              `uuid`            PK; default               Feast identifier.
                                      `gen_random_uuid()`       

  `name`            `text`            NOT NULL                  Feast package name.

  `description`     `text`            NULL allowed              Feast tagline or
                                                                description.

  `tag`             `text`            NULL allowed              Occasion badge (e.g.
                                                                "Most Popular",
                                                                "100% Satvik").

  `created_at`      `timestamptz`     NOT NULL; default `now()` Creation time.

  `updated_at`      `timestamptz`     NOT NULL; default `now()` Last update time.
  ----------------------------------------------------------------------------------

### Rules

-   Feasts can be created, edited, and deleted dynamically by the manager.
-   When a customer loads a feast, the associated dishes from `feast_items` are added to their current draft.
-   Deleting a feast does not affect existing catering records or historical orders.

------------------------------------------------------------------------

## 5.12 `feast_items`

### Purpose

Junction table associating menu items with predefined feast packages.

  --------------------------------------------------------------------------------------------------
  Column            Type              Constraints                         Description
  ----------------- ----------------- ----------------------------------- --------------------------
  `id`              `uuid`            PK; default `gen_random_uuid()`     Junction identifier.

  `feast_id`        `uuid`            FK to `feasts(id)`; ON DELETE       Parent feast package.
                                      CASCADE; NOT NULL                   

  `menu_item_id`    `uuid`            FK to `menu_items(id)`; ON DELETE   Referenced menu dish.
                                      CASCADE; NOT NULL                   

  `created_at`      `timestamptz`     NOT NULL; default `now()`           Association creation time.
  --------------------------------------------------------------------------------------------------

### Rules

-   Unique constraint on `(feast_id, menu_item_id)` prevents duplicate item assignments in the same feast.
-   Cascade deletion ensures orphaned associations are cleared when a feast or menu item is removed.

------------------------------------------------------------------------

# Chapter 6 -- Pricing and Calculation Rules

## 6.1 Item Amount

For each selected food item:

`line_amount = price_per_plate_snapshot × plate_count`

## 6.2 Food Subtotal

`food_subtotal = SUM(catering_record_items.line_amount)`

## 6.3 GST Base

The agreed Version 1 aggregate calculation rule is:

`gst_base_amount = food_subtotal + delivery_charges + customization_charges`

## 6.4 GST Rate

The Version 1 GST rate is fixed at:

`gst_rate = 5.00`

## 6.5 GST Amount

`gst_amount = ROUND(gst_base_amount × 5 / 100, 2)`

## 6.6 Final Amount

`final_amount = gst_base_amount + gst_amount`

The same calculation rule applies to the invoice snapshot.

### Example

  Component                     Amount
  ----------------------- ------------
  Food subtotal             ₹22,500.00
  Delivery charges             ₹500.00
  Customization charges      ₹1,000.00
  GST base                  ₹24,000.00
  GST at 5%                  ₹1,200.00
  Final amount              ₹25,200.00

The 5% rate and aggregate calculation are the agreed system calculation
rule for Version 1. This schema specification does not make a legal
determination about the tax treatment of any particular charge.

------------------------------------------------------------------------

# Chapter 7 -- Business Identifier Generation

## 7.1 Internal IDs

All entities use UUID primary keys for internal relationships.

Business-facing order and invoice identifiers are separate from UUID
primary keys.

## 7.2 Order Number

Format:

`TKS-ORD-YYYY-0001`

Requirements:

-   `YYYY` represents the applicable year.
-   The numeric sequence is unique within the year.
-   The sequence resets when the year changes.
-   Generated and assigned immediately upon creation for all catering records (`ONLINE` and `MANUAL`).
-   The generated value must be unique.
-   Concurrent creation must not generate duplicate order numbers.

## 7.3 Invoice Number

Format:

`TKS-INV-YYYY-0001`

Requirements:

-   `YYYY` represents the applicable year.
-   The numeric sequence is unique within the year.
-   The sequence resets when the year changes.
-   Invoice numbering is independent of order numbering.
-   Concurrent invoice generation must not generate duplicate invoice
    numbers.

## 7.4 Generation Responsibility

Number generation must be performed by a transaction-safe
backend/database mechanism. The application must not rely on a
client-side counter.

------------------------------------------------------------------------

# Chapter 8 -- Historical Snapshot Requirements

## 8.1 Catering Record Item Snapshot

Each selected item stores:

-   Item name snapshot.
-   Per-plate price snapshot.
-   Plate quantity.
-   Line amount.

The snapshot is retained even if the menu item is renamed, repriced,
moved, marked unavailable, or removed.

## 8.2 Invoice Snapshot

Each invoice stores:

-   Business details used on the invoice.
-   Customer details used on the invoice.
-   Occasion and event details.
-   Plate quantity.
-   Item names and prices.
-   Food subtotal.
-   Delivery charges.
-   Customization charges.
-   GST rate and amount.
-   Final amount.
-   Final instructions.

## 8.3 Customer Original Submission Snapshot

The original online customer submission is retained in the customer's
browser/device as a local snapshot.

It is not a server-side customer account or a live copy of the manager's
subsequently edited order.

The customer-side snapshot must not be overwritten by manager-side
edits.

## 8.4 Historical Invoice Versions

Each generated invoice is an independent historical snapshot.

Regeneration creates a new invoice record. It does not overwrite the
previous invoice record.

------------------------------------------------------------------------

# Chapter 9 -- Status and Integrity Constraints

## 9.1 Source and Initial Status

  Source   Permitted initial status
  -------- -----------------------------------
  Online   `NEW_REQUEST`
  Manual   `UNDER_DISCUSSION` or `CONFIRMED`

## 9.2 Status Meaning

-   `NEW_REQUEST`: newly submitted online enquiry awaiting manager
    attention.
-   `UNDER_DISCUSSION`: enquiry or booking under discussion.
-   `CONFIRMED`: customer and business have agreed and the manager has
    confirmed.
-   `COMPLETED`: fulfilment has taken place.
-   `CANCELLED`: record has been cancelled.

## 9.3 Confirmation Requirements

Before a record is confirmed, the backend must validate the required
customer, occasion, selected food items, plate quantity, and final
pricing information.

## 9.4 Confirmed-Order Edit Requirement

Every confirmed-order edit must be accompanied by a non-empty reason in
`record_change_reasons`.

## 9.5 Confirmed-Order Cancellation Requirement

Cancellation of a confirmed order must be accompanied by a non-empty
cancellation reason in `record_change_reasons`.

## 9.6 Historical Record Retention

Completed and cancelled records remain stored and accessible.

Ordinary menu changes must not delete historical order item snapshots or
invoice snapshots.

## 9.7 Calendar Query Rule

The confirmed-order calendar is derived from records where:

-   `status = CONFIRMED`.
-   `occasion_date` matches the selected calendar date.

Under-discussion, new-request, completed, and cancelled records are not
counted as currently confirmed bookings.

------------------------------------------------------------------------

# Chapter 10 -- Indexing Requirements

The following indexes support the access patterns explicitly required by
the BFS.

  -------------------------------------------------------------------------
  Table                     Index                   Purpose
  ------------------------- ----------------------- -----------------------
  `customers`               Unique index on         Recognize returning
                            `mobile_number`         customers.

  `catering_records`        Unique index on         Enforce unique order
                            `order_number`          identifiers.

  `catering_records`        Index on `customer_id`  Retrieve customer
                                                    history.

  `catering_records`        Index on `status`       Dashboard status
                                                    sections.

  `catering_records`        Index on                Calendar date lookup.
                            `occasion_date`         

  `catering_records`        Index on `source`       Distinguish online and
                                                    manual records.

  `catering_record_items`   Index on                Retrieve items for a
                            `catering_record_id`    record.

  `record_change_reasons`   Index on                Retrieve
                            `catering_record_id`    edit/cancellation
                                                    reasons.

  `menu_items`              Index on `category_id`  Retrieve items by
                                                    category.

  `feast_items`             Index on `feast_id`     Retrieve items in a
                                                    feast package.

  `feast_items`             Index on `menu_item_id` Retrieve feasts
                                                    containing a dish.

  `invoices`                Unique index on         Enforce unique invoice
                            `invoice_number`        identifiers.

  `invoices`                Index on                Retrieve invoices for
                            `catering_record_id`    an order.

  `invoice_items`           Index on `invoice_id`   Retrieve invoice line
                                                    items.
  -------------------------------------------------------------------------

------------------------------------------------------------------------

# Chapter 11 -- Supabase Access and Data Protection Boundaries

## 11.1 Authentication

-   The administration system uses the single administrator/manager
    account.
-   Customer catalogue browsing and enquiry submission do not require
    customer authentication.
-   Customer local history does not depend on a customer login.

## 11.2 Authorization

The database must prevent public customers from reading or modifying
administrative data.

Public customer operations are limited to the functions required to:

-   Read customer-facing available catalogue data.
-   Submit an online enquiry.

Administrative operations require the administrator/manager's
authenticated access.

## 11.3 Administrative Data

The following must not be publicly readable or writable:

-   Customer CRM records.
-   All catering records.
-   Manual records.
-   Order pricing and manager notes.
-   Edit and cancellation reasons.
-   Invoices and invoice snapshots.
-   Business settings.
-   Menu-management write operations.

## 11.4 Server-Side Validation & Secure Atomic Submission

Public submission values must be validated by trusted backend logic.

The backend must not trust client-provided totals as authoritative. It
must validate selected menu items, current applicable prices,
quantities, and calculated amounts.

Because public anonymous customers are forbidden from directly reading or
querying the `customers` and `catering_records` tables under Row Level Security,
online submission is encapsulated in a dedicated PostgreSQL function:

`submit_online_enquiry(customer_payload jsonb, enquiry_payload jsonb, items_payload jsonb) RETURNS jsonb`

This function is defined with `SECURITY DEFINER` (executing with elevated
database authority). It performs phone number normalization, customer lookup
or creation, record creation in `NEW_REQUEST` status, order number generation,
snapshot insertion, and estimate calculation in a single atomic transaction.
Direct table `SELECT` and `UPDATE` on `customers` and `catering_records`
remain strictly restricted to the authenticated manager.

## 11.5 Local Customer Data

Browser/device-local history and drafts are client-side convenience
data. They do not grant access to server-side customer records or
manager-edited order information.

------------------------------------------------------------------------

# Chapter 12 -- Data Integrity and Transaction Requirements

## 12.1 Online Enquiry Submission

The following must be treated as one successful submission operation:

1.  Validate customer submission.
2.  Find or create the customer using the mobile number.
3.  Create the online catering record with `NEW_REQUEST` status.
4.  Create the selected record-item snapshots.
5.  Calculate and store the authoritative estimate.
6.  Return successful submission confirmation only after persistence
    succeeds.

If persistence fails, the system must not report a successful
submission.

## 12.2 Manual Record Creation

Manual record creation must:

1.  Find or create the customer using the mobile number.
2.  Create a `MANUAL` catering record.
3.  Set the selected initial status: `UNDER_DISCUSSION` or `CONFIRMED`.
4.  Store available item and requirement details.
5.  Enforce confirmation requirements if the selected initial status is
    `CONFIRMED`.

## 12.3 Confirmed-Order Edit

A confirmed-order edit and its mandatory reason must be persisted
consistently. The system must not save a confirmed-order edit without
its reason.

## 12.4 Confirmed-Order Cancellation

The cancellation status and mandatory cancellation reason must be
persisted consistently.

## 12.5 Invoice Generation

Invoice generation must:

1.  Verify that the associated catering record is `CONFIRMED`.
2.  Generate a unique invoice number.
3.  Copy the current business details into invoice snapshot fields.
4.  Copy customer and event details into invoice snapshot fields.
5.  Copy current order item snapshots into `invoice_items`.
6.  Copy pricing components and calculation results.
7.  Copy final instructions when present.
8.  Persist the invoice record and its item rows consistently.

A failure must not leave an invoice header that appears complete while
its required item rows are missing.

## 12.6 Invoice Regeneration

Regeneration creates a new invoice snapshot and a new invoice number.
Previously generated invoice records remain unchanged.

------------------------------------------------------------------------

# Chapter 13 -- Entity-to-BFS Traceability

The following table maps the schema to the approved functional
requirements.

  ---------------------------------------------------------------------------
  BFS requirement                     Supporting schema
  ----------------------------------- ---------------------------------------
  Public catalogue categories         `menu_categories`

  Public catalogue food items         `menu_items`

  Predefined feast packages           `feasts`, `feast_items`

  Item availability                   `menu_items.availability`

  Customer identity and               `customers`
  returning-customer recognition      

  Online enquiry submission           `catering_records`,
                                      `catering_record_items`

  Manual enquiry/order creation       `catering_records`,
                                      `catering_record_items`

  Unified enquiry/order lifecycle     `catering_records.status`

  Online/manual source distinction    `catering_records.source`

  Customer history                    `customers`, `catering_records`,
                                      `catering_record_items`

  Dashboard calendar                  `catering_records.status`,
                                      `catering_records.occasion_date`

  Confirmed-order edit reasons &     `record_change_reasons`
  change diff                         

  Confirmed-order cancellation        `record_change_reasons`
  reasons                             

  Historical menu price preservation  `catering_record_items`

  Food subtotal and order pricing     `catering_records`,
                                      `catering_record_items`

  GST aggregate calculation           `catering_records` pricing columns

  Final instructions                  `catering_records.final_instructions`

  Invoice numbering                   `invoices.invoice_number`

  Order numbering                     `catering_records.order_number`

  Invoice history and snapshots       `invoices`, `invoice_items`

  Business details on invoices        `business_settings`, invoice snapshot
                                      columns

  Customer local history and drafts   Browser/device-local storage; not
                                      server tables
  ---------------------------------------------------------------------------

------------------------------------------------------------------------

# Chapter 14 -- Explicitly Non-Persistent or Client-Local Data

The following BFS behaviours do not require server-side database
entities in Version 1.

## 14.1 Customer Drafts

Incomplete customer enquiry forms are saved locally in the customer's
browser/device.

They are not server-side enquiries until submitted successfully.

## 14.2 Customer Submitted-History Copy

The customer-side original-submission snapshot is retained locally.

The authoritative submitted record remains in Supabase.

## 14.3 Customer Login/Profile

No customer authentication identity or customer login profile is
required.

## 14.4 Customer Local History Synchronization

The BFS accepts that local history may be unavailable after browser data
is cleared or when the customer changes devices. Cross-device recovery
is not part of the schema.

------------------------------------------------------------------------

# Chapter 15 -- Schema Compliance Rules

The implementation must satisfy all of the following:

1.  Every online submission is stored centrally in Supabase.
2.  Every online submission begins as `NEW_REQUEST`.
3.  Manual creation supports `UNDER_DISCUSSION` and `CONFIRMED` initial
    states.
4.  General enquiries can be stored as incomplete manual records under
    discussion.
5.  Returning customers are recognized by mobile number.
6.  Customer history is retrievable through the customer-to-record
    relationship.
7.  The confirmed-order calendar counts only confirmed records.
8.  Confirmed-order edits require reasons and structured change diff.
9.  Confirmed-order cancellations require reasons.
10. Completed and cancelled records remain stored.
11. Menu item names and prices are snapshotted on catering record items.
12. Invoices can only be generated for confirmed orders.
13. Each invoice has a unique identifier in the agreed format.
14. Each order has a unique identifier in the agreed format.
15. Invoice numbering and order numbering are independent.
16. Each invoice stores business, customer, event, item, and pricing
    snapshots.
17. Regenerated invoices do not overwrite previous invoice records.
18. GST uses the agreed aggregate calculation base and fixed 5% rate for
    Version 1.
19. Final instructions are stored on the catering record and included on
    invoices when present.
20. Customer local drafts and original submitted-history copies remain
    browser/device-local.
21. Predefined feast packages and item associations are stored in dedicated
    schema tables.
22. No schema component introduces customer accounts, payment
    processing, inventory, multi-role administration, or other
    functionality outside the approved BFS.

------------------------------------------------------------------------

# Chapter 16 -- Relationship to the Approved BFS

This DSS is a database translation of the approved Backend Functional
Specification v1.0.

If a schema decision appears to conflict with the BFS, the BFS takes
precedence. The implementation must not use the DSS to introduce a new
business rule or workflow.

Any change to business behaviour must first be approved as a BFS change.
The DSS can then be revised to reflect that change.

------------------------------------------------------------------------

**End of Database Schema Specification -- Version 1.0**
