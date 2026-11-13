# Backend Functional Specification (BFS)

## Version 1.0

**Project:** TKS Iyengar's Catering Management System\
**Document Version:** 1.0\
**Status:** Functional requirements consolidated for review\
**Backend:** Supabase\
**Backend Language:** TypeScript\
**Development Environment:** Antigravity IDE

------------------------------------------------------------------------

# Chapter 1 -- Project Overview

## 1.1 Purpose

This document defines the backend functional requirements for Version 1
of TKS Iyengar's Catering Management System.

It is the functional source of truth for backend development and will
serve as the basis for the Database Schema Specification (DSS).

The BFS describes the system's modules, business workflows, data
behaviour, validation requirements, record lifecycle, and backend
responsibilities. It does not contain implementation code or prescribe
the physical database schema.

## 1.2 Project Objective

The system will provide:

-   A public digital catering catalogue through which customers can
    browse food items and submit catering enquiries.
-   A manager-facing administration system for managing menu data,
    customer enquiries, manual enquiries/orders, confirmed orders, and
    invoices.
-   A lightweight customer relationship management (CRM) capability that
    retains customer interaction and order history.
-   Centralized persistence of all submitted business records in
    Supabase.
-   Local customer-side persistence so customers can revisit their
    submitted enquiry history without creating an account.

The system is intended to support the catering business's
enquiry-to-order workflow. It is not intended to operate as a full
restaurant POS, inventory management system, accounting package, or
online payment platform.

## 1.3 Version 1 Scope

Version 1 includes:

1.  Public food catalogue.
2.  Customer item selection and enquiry submission.
3.  Customer-side draft persistence and submitted-enquiry history.
4.  Admin authentication and administration.
5.  Dashboard and confirmed-order calendar.
6.  Online enquiry management.
7.  Manual enquiry/order creation.
8.  Customer records and lightweight CRM.
9.  Menu and category management.
10. Order pricing and confirmation.
11. Order editing and cancellation with reasons.
12. Invoice generation, PDF download, and native sharing.
13. Business profile settings used by invoices.
14. Predefined Feasts / Curated Packages management and 1-tap catalogue loading.

## 1.4 Out of Scope

The following are not part of the agreed Version 1 scope:

-   Customer login, registration, passwords, or customer accounts.
-   OTP-based customer identity verification.
-   Online payment gateway integration or payment collection inside the
    system.
-   Automatic payment verification.
-   Inventory, stock, or ingredient management.
-   Kitchen display or production management.
-   Multi-branch or multi-catering-location management.
-   Multiple administrator roles or staff permission hierarchies.
-   Automated WhatsApp messaging or WhatsApp Business API integration.
-   Marketing automation, loyalty points, or customer scoring.
-   Full accounting or bookkeeping functionality.

Payment arrangements are handled separately by the business and
customer.

## 1.5 Backend Technology

The agreed backend foundation is:

  Component                       Agreed technology
  ------------------------------- -------------------
  Backend platform and database   Supabase
  Backend development language    TypeScript
  Development environment         Antigravity IDE

The functional requirements in this document are independent of specific
implementation details such as individual API route names, SQL
statements, or UI component structure.

## 1.6 Core System Principles

### 1.6.1 Central source of truth

Supabase is the authoritative store for all submitted enquiries,
customer records, orders, menu data, business settings, and invoices or
invoice-related records.

### 1.6.2 No customer account requirement

Customers must be able to browse the catalogue and submit enquiries
without registering or logging in.

### 1.6.3 Local customer convenience

The customer's browser/device maintains local copies of submitted
enquiry history and locally saved drafts. Local data is a convenience
layer and does not replace the Supabase record.

### 1.6.4 Preserve business history

Changes to menu names, prices, or availability must not silently change
historical order details or previously generated invoice information.

### 1.6.5 One administration account for Version 1

Version 1 will operate with one administrator/manager account. Multiple
staff accounts and role-based access are not included at this stage.

------------------------------------------------------------------------

# Chapter 2 -- User Types and Access

## 2.1 Customer

A customer can:

-   Browse the public catalogue.
-   Select and deselect food items.
-   Review the selected items and estimated amount.
-   Enter occasion and delivery information.
-   Enter contact information.
-   Submit an enquiry without logging in.
-   Revisit locally retained submitted enquiry history on the same
    browser/device.
-   Resume locally retained incomplete enquiry drafts.

A customer cannot access the administration system.

## 2.2 Administrator / Manager

The administrator/manager can:

-   Access the admin dashboard.
-   View and manage incoming online enquiries.
-   Create manual enquiries/orders.
-   View and manage customer records.
-   Manage categories and food items.
-   Manage item availability and menu prices.
-   Confirm, complete, edit, or cancel orders according to the defined
    workflow.
-   Set final order pricing and instructions.
-   Generate, download, and share invoices.
-   Configure business details used on invoices.

Version 1 does not distinguish between administrator, manager, and other
staff roles.

------------------------------------------------------------------------

# Chapter 3 -- Customer Catalogue and Enquiry Workflow

## 3.1 Catalogue Overview

The public catalogue displays food items grouped under categories.

The catalogue is managed through the administration system. Categories
and food items must not be hardcoded as fixed business data.

## 3.2 Category Display

The customer-facing catalogue shall:

-   Display the categories configured by the manager.
-   Display the food items belonging to each category.
-   Reflect category ordering configured by the manager.
-   Exclude items marked unavailable from customer selection.
-   Reflect menu changes made by the manager.

The manager can create, edit, reorder, and remove categories.

## 3.3 Food Item Display

Each customer-facing food item card displays only:

-   Item image.
-   Item name.
-   Price per plate.

A food description is not part of the agreed customer-facing item card.

The manager can create and edit food items and maintain their category,
name, price, image, and availability.

## 3.4 Item Selection

Customers select or deselect items through the visual item-card
interaction.

The selection rules are:

-   A customer may select items from multiple categories.
-   The selected state must be visually distinguishable.
-   Selecting an item adds it to the current enquiry selection.
-   Deselecting an item removes it from the current selection.
-   The customer cannot proceed to the next stage until at least one
    item is selected.
-   The selected items must remain available while the customer moves
    between enquiry stages.

## 3.5 Enquiry Information

After selecting items, the customer proceeds to the enquiry details
stage.

The customer provides:

-   Occasion type.
-   Occasion date.
-   Number of plates/meals.
-   Delivery address.
-   Special instructions.

The selected-item summary is displayed alongside the enquiry details.

## 3.6 Customer-Side Price Estimate

The system calculates the estimated food price using the selected menu
items and the number of plates.

**Price per plate**

The price per plate is the sum of the per-plate prices of all selected
items.

**Estimated food subtotal**

Estimated food subtotal = Price per plate × Number of plates.

The customer is shown:

-   Selected items.
-   Price per plate for each selected item.
-   Combined price per plate.
-   Number of plates.
-   Estimated food total.

The customer-facing estimate must include a notice that delivery fees
and customization charges may apply.

The estimate is indicative. Final pricing is determined by the manager
after discussion with the customer.

The customer does not enter a budget.

## 3.7 Customer Contact Details

The customer provides:

-   Customer name.
-   Mobile number.

These details are collected after the occasion and food-selection
details.

Customer login or account creation is not required.

## 3.8 Submission Confirmation

After a successful server-side submission, the customer sees a
confirmation screen stating:

-   The enquiry was submitted successfully.
-   The catering team will contact the customer within 24 hours.
-   An urgent-contact phone number is available as a clickable telephone
    link that opens the device dialler.

The system must not display a successful-submission confirmation unless
the enquiry has been successfully persisted in Supabase.

## 3.9 Online Enquiry Creation

A successfully submitted online enquiry is stored centrally and becomes
visible to the manager in the **New Requests** section.

It is an incoming enquiry awaiting manager action. It is not
automatically a confirmed booking.

The manager takes over the enquiry from this point and can review the
submitted details, contact the customer, update the requirements, and
move the enquiry through the agreed order workflow.

## 3.10 Predefined Feasts / Curated Packages

The customer-facing catalogue can feature curated predefined feast packages
(e.g., "Royal Mysore Kalyana Feast", "Traditional Muhurtham Breakfast", "Satvik Ayushya Homam").

The customer can:
- Browse curated feast spreads with occasion badges (e.g., "Most Popular", "100% Satvik").
- Inspect the list of traditional delicacies included in the feast.
- Load the feast into their selection with a single tap ("Load This Feast"), which automatically adds all included dishes to their current enquiry draft.
- Further customize, add, or remove dishes as desired before submission.

Predefined feasts are managed dynamically by the manager through the administration system.

------------------------------------------------------------------------

# Chapter 4 -- Customer-Side Local Persistence

## 4.1 Purpose

Local persistence allows customers to revisit submitted enquiries and
resume incomplete enquiry forms without customer accounts.

## 4.2 Submitted Enquiry History

After an enquiry is successfully submitted:

-   The authoritative record is stored in Supabase.
-   A corresponding local copy is maintained in the customer's
    browser/device.
-   The customer can revisit the locally stored enquiry history without
    logging in.
-   Local history is associated with the browser/device in which the
    enquiry was submitted.

## 4.3 Original Submission Snapshot

The local history must preserve a snapshot of what the customer
originally submitted.

If the manager subsequently edits the server-side enquiry or order, the
customer's local original-submission snapshot must not be silently
overwritten.

The local history represents the customer's original submission, not a
live synchronized view of the manager's latest order record.

## 4.4 Draft Persistence

The system must also save incomplete enquiry progress locally,
including:

-   Selected food items.
-   Occasion details entered so far.
-   Plate quantity.
-   Delivery address.
-   Special instructions.
-   Customer contact details entered so far.

If the customer refreshes the page or returns later using the same
browser/device, the system should restore the locally saved draft so the
customer can continue.

## 4.5 Local History and Draft Management

Submitted history and incomplete drafts must be distinguishable.

The customer must have a simple way to clear locally retained
history/draft data.

Clearing browser data, using another browser/device, or changing devices
may make the local history and drafts unavailable. This limitation is
accepted for Version 1.

Local data must never be treated as proof that a server-side enquiry was
successfully submitted.

## 4.6 Server and Local Data Relationship

-   Supabase is the central source of truth for submitted records.
-   Local storage is a customer convenience feature.
-   A local draft is not a submitted enquiry.
-   A failed server submission must not be presented as successful.
-   The system must avoid creating a false submitted-history entry when
    server persistence fails.

------------------------------------------------------------------------

# Chapter 5 -- Administration Dashboard

## 5.1 Dashboard Purpose

The dashboard gives the manager a consolidated view of incoming
enquiries and confirmed catering commitments.

## 5.2 Calendar

The dashboard includes a calendar based on occasion dates.

The calendar:

-   Displays confirmed orders only.
-   Shows the count of confirmed orders for each date.
-   Does not count enquiries that are still under discussion.
-   Does not count cancelled orders as confirmed bookings.

When the manager selects a date, the system displays the confirmed
orders for that date in a side panel or corresponding list.

## 5.3 Calendar Order Summary

The selected-date order list displays, at minimum:

-   Customer name.
-   Occasion.
-   Plate count.
-   Source: Online or Manual.
-   Order status.

The manager can open an order to view its complete details.

## 5.4 New Requests

The New Requests section displays newly submitted online enquiries that
require manager attention.

The manager can:

-   Open and inspect an incoming enquiry.
-   View the customer's submitted information and selected items.
-   Review the estimated price information.
-   Update the enquiry/order details as required during discussion.
-   Move the record into the appropriate management stage.

## 5.5 Active Orders

The Active Orders section provides access to orders that are being
handled by the business, including records under discussion and
confirmed orders.

The manager can open a record to inspect its details and perform
permitted actions.

## 5.6 All Orders

The All Orders section provides access to online and manual records,
including past and upcoming records.

The manager must be able to distinguish the source of a record and its
current status.

## 5.7 Manual Creation

The dashboard provides a **Create Manual Order** action.

During manual creation, the manager chooses one of two initial states:

1.  **Under Discussion**
2.  **Confirmed**

A manual record may be created for a customer who has contacted the
business by telephone or in person. It can contain the information
available at that point and be completed progressively as requirements
are established.

General enquiries are also recorded through this manual creation
workflow, rather than through a separate general-enquiry creation
module.

------------------------------------------------------------------------

# Chapter 6 -- Enquiry and Order Management

## 6.1 Unified Record Management

Online enquiries and manually created enquiries/orders are managed
within the same order-management area.

Each record must retain its source:

-   Online
-   Manual

Online submissions enter through New Requests. Manual records are
created by the manager using the Create Manual Order workflow.

## 6.2 Order/Enquiry Information

The record supports the following information:

### Customer information

-   Customer name.
-   Mobile number.
-   Delivery address, where available.

### Occasion information

-   Occasion type.
-   Occasion date.
-   Number of plates/meals.

### Food selection

-   Selected food items.
-   Item names.
-   Per-plate prices applicable to the record.
-   Item-level amounts.
-   Food subtotal.

### Additional information

-   Customer special instructions.
-   Enquiry notes.
-   Delivery charges.
-   Customization charges.
-   GST.
-   Final amount.
-   Final instructions.

Information can be completed progressively where the record is initially
a general or incomplete enquiry.

## 6.3 Online Enquiry Management

For online enquiries:

-   Submitted customer information is populated automatically.
-   The manager can inspect the original submission.
-   The manager can edit the working enquiry/order details after
    discussion with the customer.
-   The manager can update selected items, plate quantity, occasion
    details, delivery address, and instructions.
-   The manager can finalize pricing and confirm the order after the
    customer agrees.

The original customer submission snapshot must remain preserved
separately from the manager's subsequent edits.

## 6.4 Manual Enquiry/Order Management

For manual records, the manager enters the customer and event
information available during the interaction.

The manager can:

-   Select food items from the managed catalogue.
-   Enter or update plate quantity.
-   Enter occasion information.
-   Enter delivery details.
-   Add enquiry notes and special instructions.
-   Set the initial state to Under Discussion or Confirmed.

A manual record under discussion can be completed progressively.

## 6.5 General Enquiries

A customer may contact the business without committing to an event or
selecting a menu.

The manager records this interaction through Create Manual Order.

The record can initially contain the customer details and available
enquiry information. Additional occasion, menu, quantity, and pricing
details can be entered if the discussion progresses.

## 6.6 Status Lifecycle

The system supports these business statuses:

  -----------------------------------------------------------------------
  Status                              Meaning
  ----------------------------------- -----------------------------------
  New Request                         A newly submitted online enquiry
                                      awaiting manager attention.

  Under Discussion                    The manager is discussing
                                      requirements or pricing with the
                                      customer; the booking is not
                                      confirmed.

  Confirmed                           The customer has agreed to the
                                      booking and the manager has
                                      confirmed it.

  Completed                           The catering event/order has been
                                      fulfilled.

  Cancelled                           The enquiry/order has been
                                      cancelled.
  -----------------------------------------------------------------------

The New Request state applies to incoming online submissions. Manual
creation offers Under Discussion or Confirmed as its two initial
options.

An enquiry under discussion can be confirmed or cancelled. A confirmed
order can be completed or cancelled.

Cancelled records remain in the system and must remain accessible
through order history.

## 6.7 Order Confirmation

An order is confirmed only when the customer and business have agreed to
the booking and the manager explicitly confirms it in the system.

Before confirmation, the manager must have the required customer,
occasion, menu, quantity, and final pricing information.

Confirmation is a business decision made by the manager. Online
submission alone does not confirm an order.

## 6.8 Confirmed-Order Editing

The manager is allowed to edit a confirmed order.

Every edit to a confirmed order must include:
1. A mandatory non-empty reason explaining why the change was made (e.g., "Client requested 50 additional plates and added Kesari Bath").
2. A structured change diff automatically capturing what was changed (e.g., modified fields, previous item snapshots/quantities versus new item snapshots/quantities).

The reason and change diff must be permanently recorded and associated with the edit so that the business has a complete, transparent audit trail.

The order's current details must reflect the latest accepted changes,
while the system retains the historical item and price information
needed for previously generated invoices and order history.

## 6.9 Order Cancellation

The manager can cancel an order.

When cancelling a confirmed order, the manager must provide a
cancellation reason.

Cancelled records must not be physically deleted as part of ordinary
cancellation. They remain available in the system's order history.

## 6.10 Order Completion

The manager can mark an order as Completed after the catering event has
been fulfilled.

Completed orders remain available in historical order records and
customer history.

------------------------------------------------------------------------

# Chapter 7 -- Customer Records and Lightweight CRM

## 7.1 Purpose

The CRM provides a central view of customers who have interacted with
the catering business.

It supports customer recognition and access to previous enquiries and
orders. It is not a marketing automation or lead-scoring system.

## 7.2 Customer Creation and Recognition

A customer record is created or identified as part of recording an
enquiry/order.

The customer's mobile number is used to recognize returning customers
and associate subsequent records with the existing customer where the
number matches.

To ensure consistent recognition, the system enforces mobile number
standardization: all non-digit characters, leading zeros, and optional
country code prefixes (e.g. +91) are normalized into a canonical format
before matching or storing. A single unique record is maintained per
standardized mobile number.

A separate standalone Create Customer workflow is not required for
Version 1.

## 7.3 Customer Information

The customer record supports:

-   Customer name.
-   Mobile number (standardized, unique).
-   Address, where available.
-   First-contact date.
-   Last-contact date.
-   Enquiry and order history.
-   General customer notes (manager notes on preferences, family traditions, or special instructions).
-   Enquiry notes from related records.

Customer information may be updated by the manager when required.

## 7.4 Customer Detail View

The manager can open a customer record and view:

-   Customer contact information.
-   Previous enquiries.
-   Confirmed orders.
-   Past occasion details and dates.
-   Plate quantities.
-   Special instructions.
-   Enquiry notes.

The customer detail view must provide access to the customer's complete
recorded interaction history.

## 7.5 General Enquiry Records

General enquiries that do not become confirmed bookings must remain part
of the customer's recorded interaction history.

A general enquiry does not need to become a confirmed order to be
retained in CRM history.

## 7.6 Customer Data Export

The administration system includes customer CSV export.

The export is intended to allow the business to obtain its customer
records in a portable tabular format.

------------------------------------------------------------------------

# Chapter 8 -- Menu and Category Management

## 8.1 Menu Management Overview

The manager maintains the catalogue through the administration system.

Changes to the managed catalogue are reflected in the public customer
catalogue.

## 8.2 Category Management

The manager can:

-   Create categories.
-   Edit category names.
-   Reorder categories.
-   Remove categories.

Categories are configurable business data and are not restricted to a
fixed predefined list.

## 8.3 Food Item Management

The manager can:

-   Add food items.
-   Edit food items.
-   Remove food items.
-   Update item names.
-   Update per-plate prices.
-   Add or change item images.
-   Move items between categories.
-   Change item availability.

## 8.4 Item Availability

An item can be marked unavailable without deleting it.

Unavailable items must not be selectable by customers in the public
catalogue.

The manager can make the item available again.

## 8.5 Price Changes

The current menu price is used for new customer selections and new
manual records.

A menu price change must not alter the price snapshot already associated
with an existing order.

## 8.6 Historical Item Preservation

Order records must preserve the item name and applicable price used for
the order.

Changes to the menu catalogue must not silently rewrite historical order
item names or prices.

This rule applies to historical order information and invoice accuracy.

## 8.7 Predefined Feasts Management

The manager can maintain predefined catering feasts dynamically through
the administration system.

The manager can:
- Create new predefined feasts with a package name, description, and occasion tag/badge (e.g. "Most Popular", "Morning Feasts", "100% Satvik").
- Associate multiple curated food items from the active catalogue with the feast.
- Edit existing feast details or modify the dishes assigned to a feast.
- Delete feasts that are no longer offered.
- All changes are synchronized across devices through the central backend store.

------------------------------------------------------------------------

# Chapter 9 -- Pricing and Finalization

## 9.1 Pricing Components

The manager finalizes the order amount using:

-   Food subtotal.
-   Delivery charges.
-   Customization charges.
-   GST.
-   Final amount.

## 9.2 Food Subtotal

The food subtotal is calculated from the selected items and plate
quantity.

For each selected item:

Item amount = Item price per plate × Number of plates.

Food subtotal = Sum of all item amounts.

## 9.3 Delivery and Customization Charges

The manager can enter delivery charges and customization charges for the
order.

These charges are included in the final amount.

The customer-facing initial estimate does not include these charges and
must communicate that they may apply.

## 9.4 GST

The GST rate for Version 1 is fixed at **5%**.

The GST amount is displayed separately in the order pricing summary and
invoice.

## 9.5 Final Amount

The final amount includes:

-   Food subtotal.
-   Delivery charges.
-   Customization charges.
-   GST.

The manager reviews the final pricing before confirming the order.

## 9.6 Final Instructions

The manager can enter final instructions for the order.

Final instructions represent the final arrangements or directions agreed
for fulfilment. They are distinct from the customer's original special
instructions.

Examples may include delivery timing, packing arrangements, or
coordination instructions.

Final instructions must:

-   Be visible to the manager in a dedicated section of the order view.
-   Be retained with the order.
-   Appear on the generated invoice.

If no final instructions are entered, the invoice should not display an
empty final-instructions section.

------------------------------------------------------------------------

# Chapter 10 -- Invoice Management

## 10.1 Invoice Eligibility

An invoice can be generated only after an order has been confirmed.

An enquiry that is still New Request or Under Discussion must not be
treated as an invoice-ready confirmed order.

## 10.2 Invoice Numbering

Invoice numbers follow the agreed format:

`TKS-INV-YYYY-0001`

Example:

`TKS-INV-2026-0001`

The invoice number is generated automatically and uniquely. The invoice
sequence is separate from the order-number sequence and resets with the
year.

## 10.3 Order Numbering

Order identifiers follow the agreed format:

`TKS-ORD-YYYY-0001`

Example:

`TKS-ORD-2026-0001`

Order identifiers are generated and assigned immediately upon the creation
of any catering record (both online submissions in `New Request` status and
manually created records). This ensures that every enquiry has a persistent,
unique tracking reference from the moment it enters the system.

Order identifiers and invoice numbers are separate business identifiers.

## 10.4 Invoice Information

The invoice uses the following structure and information.

### Business information

-   Business name.
-   Business logo.
-   Business address.
-   Business phone number.
-   GSTIN.

### Invoice information

-   Invoice number.
-   Invoice date.

### Billed-to information

-   Customer name.
-   Customer mobile number.
-   Customer address.

### Event booking information

-   Occasion/event name.
-   Occasion date.
-   Service time, where entered.
-   Number of plates.

### Itemized food table

  Field             Description
  ----------------- -------------------------------------------
  Item              Food item name
  Price per plate   Agreed per-plate item price
  Plates            Number of plates
  Amount            Item price per plate multiplied by plates

### Pricing summary

-   Food subtotal.
-   Delivery charges.
-   Customization charges.
-   GST (5%).
-   Final amount.

### Additional information

-   Final instructions, when present.
-   Closing message.

The invoice layout will use the customer-provided reference screenshot
as its starting point. The screenshot is a base format and does not
prevent refinement of the final invoice layout.

## 10.5 Historical Invoice Accuracy

An invoice must preserve the item names, quantities, prices, and totals
applicable when it was generated.

A later menu price change must not change an already generated invoice.

If a confirmed order is edited and its pricing changes, the manager can
regenerate the invoice. The regenerated invoice must reflect the updated
order details and pricing while the previously generated invoice
information remains historically identifiable.

## 10.6 Invoice PDF

The system must generate an invoice as a PDF.

The manager can:

-   Download/save the PDF.
-   Share the PDF using the device's native sharing options.

No direct WhatsApp API or external messaging integration is required.

## 10.7 Invoice Business Details

Business details are configured from the admin-side Settings section.

The manager can configure:

-   Catering business name.
-   Logo.
-   Address.
-   Phone number.
-   GSTIN.

The configured business details are automatically populated on invoices.

------------------------------------------------------------------------

# Chapter 11 -- Administration Settings

## 11.1 Settings Overview

The admin-side Settings section contains the business information used
by the invoice system.

## 11.2 Business Profile Settings

The manager can create or update:

-   Business name.
-   Business logo.
-   Business address.
-   Business phone number.
-   GSTIN.

Changes to business settings apply to invoices generated using the
current business profile.

Previously generated invoices must retain the business information that
appeared on them at the time of generation.

------------------------------------------------------------------------

# Chapter 12 -- Validation and Business Rules

## 12.1 Customer Enquiry Validation

The customer cannot proceed from food selection without selecting at
least one item.

The enquiry must collect the agreed occasion, date, plate quantity,
delivery address, selected items, customer name, and mobile number
before successful submission.

The system must validate required fields and acceptable input values
before accepting the submission.

## 12.2 Server Submission Validation

The system must verify that:

-   The selected items exist.
-   The selected items are available for customer selection.
-   Required enquiry information is present.
-   The plate quantity is valid.
-   Customer contact information is present.

The server must calculate or validate submitted price information using
authoritative menu/order data rather than blindly trusting a
customer-supplied total.

To protect customer privacy and prevent unauthorized access to CRM records,
public online enquiry submission is executed via a secure database
procedure (RPC). This routine atomically normalizes the customer's phone
number, matches or creates the customer record, creates the catering record
with `New Request` status and unique `TKS-ORD-YYYY-0001` identifier, records
the item snapshots, and calculates authoritative amounts without granting
public users direct read access to the customer or order database tables.

## 12.3 Manual Record Validation

Manual records can be created with the information available at the time
of the interaction.

A record must contain sufficient required information before it can be
confirmed.

A general enquiry may remain incomplete and under discussion until the
business obtains the remaining details.

## 12.4 Confirmation Validation

Before confirming an order, the manager must ensure that the required
customer, occasion, menu, quantity, and final pricing information is
available.

## 12.5 Confirmed-Order Edit Validation

An edit to a confirmed order requires a non-empty reason.

## 12.6 Cancellation Validation

Cancellation of a confirmed order requires a non-empty cancellation
reason.

## 12.7 Invoice Validation

An invoice can be generated only for a confirmed order.

The invoice must include the required business, customer, event, item,
and pricing information.

## 12.8 Historical Data Validation

Menu changes must not modify historical order item snapshots or
previously generated invoice information.

The customer's locally stored original-submission snapshot must not be
overwritten by manager-side edits.

------------------------------------------------------------------------

# Chapter 13 -- Data Persistence and Record Integrity

## 13.1 Central Persistence

Supabase stores all submitted and managed business records, including:

-   Customer enquiries.
-   Customer records.
-   Manual records.
-   Orders.
-   Order item details and historical price information.
-   Menu categories.
-   Menu items.
-   Business settings.
-   Invoice-related information.
-   Order edit reasons and cancellation reasons.

## 13.2 Local Persistence

Customer-side local persistence stores:

-   Successfully submitted enquiry snapshots.
-   In-progress enquiry drafts.

Local persistence is browser/device-specific and does not provide
cross-device synchronization or identity-based recovery.

## 13.3 Record Retention

Ordinary editing, cancellation, and menu removal must not cause
historical business records to disappear.

Cancelled orders and completed orders remain accessible in the system.

## 13.4 Referential and Historical Consistency

The backend must maintain consistent relationships between customers,
enquiries, orders, menu items, and invoices.

Historical order and invoice details must remain understandable even
after the corresponding menu item or category is changed or removed.

------------------------------------------------------------------------

# Chapter 14 -- Backend Functional Modules

The backend shall be organized around the following functional
responsibilities.

  -----------------------------------------------------------------------
  Module                              Responsibility
  ----------------------------------- -----------------------------------
  Public Catalogue                    Provide customer-facing categories
                                      and available food items.

  Customer Enquiries                  Accept and persist online
                                      enquiries.

  Local Persistence Support           Support the customer-side draft and
                                      submitted-history behaviour.

  Administration                      Support manager access and
                                      administrative operations.

  Dashboard                           Provide New Requests, Active
                                      Orders, All Orders, and calendar
                                      data.

  Order Management                    Create, update, confirm, complete,
                                      and cancel records.

  Menu Management                     Manage categories, food items,
                                      prices, images, and availability.

  Predefined Feasts                   Manage curated feast packages, occasion
                                      tags, and associated menu items.

  Customer CRM                        Recognize customers and provide
                                      their interaction history.

  Pricing                             Calculate item amounts, food
                                      subtotal, charges, GST, and final
                                      amount.

  Invoice Management                  Generate invoice records and PDF
                                      output, and support download/share.

  Business Settings                   Store business details used by
                                      invoices.
  -----------------------------------------------------------------------

This module list describes functional responsibilities. It does not
mandate specific source-code folders, API route names, or database table
names.

------------------------------------------------------------------------

# Chapter 15 -- Operational Workflows

## 15.1 Online Customer Enquiry

1.  Customer opens the public catalogue.
2.  Customer browses categories and food items.
3.  Customer selects one or more items.
4.  Customer proceeds to the enquiry details stage.
5.  Customer enters occasion type, occasion date, plate quantity,
    delivery address, and special instructions.
6.  System displays the selected-item summary and estimated food amount.
7.  Customer enters name and mobile number.
8.  Customer submits the enquiry.
9.  Backend validates and stores the enquiry in Supabase.
10. Customer-side local history stores the original submitted snapshot.
11. Customer sees the successful-submission confirmation.
12. The enquiry appears in the manager's New Requests section.
13. Manager reviews the request and contacts the customer.
14. Manager updates the working requirements and pricing as agreed.
15. Manager confirms the order when the customer agrees.
16. Manager generates the invoice.
17. The order can later be marked Completed or Cancelled.

## 15.2 Manual Enquiry -- Under Discussion

1.  Manager selects Create Manual Order.
2.  Manager chooses Under Discussion.
3.  Manager enters the customer information and available requirements.
4.  Manager selects food items when known.
5.  Manager saves the record.
6.  The record is available in order management and customer history.
7.  Manager updates the record as discussions progress.
8.  Manager confirms or cancels the record as appropriate.

## 15.3 Manual Order -- Confirmed

1.  Manager selects Create Manual Order.
2.  Manager chooses Confirmed.
3.  Manager enters the required customer and event details.
4.  Manager selects the agreed food items and plate quantity.
5.  Manager finalizes delivery charges, customization charges, GST, and
    final amount.
6.  Manager enters final instructions, where applicable.
7.  Manager confirms the record.
8.  Manager generates the invoice.
9.  The order appears in the confirmed-order calendar.

## 15.4 General Enquiry

1.  Customer contacts the business by telephone or in person.
2.  Manager selects Create Manual Order.
3.  Manager chooses Under Discussion.
4.  Manager records the customer details and information available from
    the interaction.
5.  The record remains available for future updates.
6.  If the customer proceeds, the manager completes the requirements and
    confirms the order.
7.  If the customer does not proceed, the record remains an enquiry or
    can be cancelled as appropriate.

## 15.5 Confirmed-Order Modification

1.  Manager opens a confirmed order.
2.  Manager edits the required order information.
3.  Manager provides a reason for the edit.
4.  System validates and saves the changes.
5.  Current order details reflect the accepted changes.
6.  Previously generated invoice information remains historically
    identifiable.
7.  Manager can regenerate the invoice to reflect the updated order.

## 15.6 Order Cancellation

1.  Manager opens the relevant record.
2.  Manager selects cancellation.
3.  For a confirmed order, manager enters a cancellation reason.
4.  System records the cancellation.
5.  The record remains visible in order history.
6.  A cancelled order is not counted as a confirmed booking on the
    calendar.

## 15.7 Order Completion

1.  Manager opens a confirmed order after fulfilment.
2.  Manager marks it Completed.
3.  The completed order remains accessible in All Orders and customer
    history.

------------------------------------------------------------------------

# Chapter 16 -- Version 1 Functional Boundaries

The following boundaries are intentional:

-   Customers do not have accounts.
-   Customer history is local to the browser/device.
-   Supabase remains authoritative for submitted records.
-   The system records enquiries and orders; it does not collect
    payments.
-   Invoice sharing uses native device sharing.
-   The system has one administrator/manager account for now.
-   Menu availability is managed manually.
-   GST is fixed at 5% for Version 1.
-   The system is a catering enquiry, order, customer-history, and
    invoicing tool---not a full ERP.

------------------------------------------------------------------------

# Chapter 17 -- BFS Completion and Relationship to DSS

## 17.1 Functional Authority

This BFS defines the agreed Version 1 functional behaviour of TKS
Iyengar's Catering Management System.

Any database entity, relationship, field, constraint, or historical
snapshot required by these behaviours must be represented in the DSS.

## 17.2 DSS Derivation

The Database Schema Specification shall be derived from this BFS.

The DSS shall translate the functional requirements into a relational
data model, including:

-   Entities.
-   Attributes.
-   Primary keys.
-   Foreign keys.
-   Relationships.
-   Constraints.
-   Historical snapshots.
-   Audit information.

The DSS must not introduce new business workflows or features that are
not supported by this BFS.

## 17.3 Change Control

If a functional requirement changes after approval of this BFS, the BFS
should be updated first. Any corresponding DSS changes should then be
derived from the revised functional requirement.

------------------------------------------------------------------------

**End of Backend Functional Specification -- Version 1.0**
