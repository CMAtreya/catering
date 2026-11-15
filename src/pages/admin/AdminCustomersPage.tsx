import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Download,
  FileEdit,
  FilePlus,
  FileText,
  Loader2,
  MapPin,
  MessageSquare,
  MessageSquarePlus,
  Phone,
  Save,
  Scroll,
  Search,
  Send,
  X,
} from "lucide-react";
import { getCustomers, getOrders, recordEnquiry } from "@/api";
import type { CustomerRecord, Order } from "@/data/mockData";
import { toast } from "sonner";
import { AdminAppShell } from "@/components/admin/AdminAppShell";
import { CustomSelect } from "@/components/ui/custom-select";

interface SupervisorNoteItem {
  id: string;
  author: string;
  timestamp: string;
  note: string;
  borderClass: string;
}

export const AdminCustomersPage: React.FC = () => {
  const navigate = useNavigate();

  // Data State
  const [customers, setCustomers] = useState<CustomerRecord[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // View Controller Mode ('directory' | 'detail')
  const [viewState, setViewState] = useState<"directory" | "detail">(
    "directory",
  );

  // Selected Customer Phone for Detail View
  const [selectedPhone, setSelectedPhone] = useState<string>("");

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeFilter, setActiveFilter] = useState<
    "all" | "confirmed" | "repeat" | "enquiries"
  >("all");

  // Record Enquiry Modal State
  const [isEnquiryModalOpen, setIsEnquiryModalOpen] = useState<boolean>(false);
  const [enquiryTopic, setEnquiryTopic] = useState<string>(
    "Sashti Poorthi (60th Birthday)",
  );
  const [enquiryExpected, setEnquiryExpected] = useState<string>(
    "Approx 120 - 150 plates",
  );
  const [enquiryNotes, setEnquiryNotes] = useState<string>("");
  const [isFollowUpChecked, setIsFollowUpChecked] = useState<boolean>(true);
  const [isSavingEnquiry, setIsSavingEnquiry] = useState<boolean>(false);

  // Supervisor Notes State for Selected Customer
  const [supervisorNotes, setSupervisorNotes] = useState<SupervisorNoteItem[]>(
    [],
  );
  const [newNoteInput, setNewNoteInput] = useState<string>("");

  // Load Data
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    Promise.all([getCustomers(), getOrders()])
      .then(([custList, ordList]) => {
        if (isMounted) {
          const sorted = [...custList].sort((a, b) =>
            (b.lastContacted || "").localeCompare(a.lastContacted || ""),
          );
          setCustomers(sorted);
          setOrders(ordList);
          if (sorted.length > 0) {
            setSelectedPhone(
              (prev) => prev || sorted[0].phone.replace(/\D/g, "").slice(-10),
            );
          }
          setIsLoading(false);
        }
      })
      .catch((err) => {
        console.error("Failed to load customers data:", err);
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Helper to get initials
  const getInitials = (name: string): string => {
    if (!name) return "C";
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  // Active selected customer
  const selectedCustomer = useMemo(() => {
    if (customers.length === 0) return null;
    const cleanTarget = selectedPhone.replace(/\D/g, "").slice(-10);
    const found = customers.find(
      (c) => c.phone.replace(/\D/g, "").slice(-10) === cleanTarget,
    );
    return found || customers[0];
  }, [customers, selectedPhone]);

  // Orders for selected customer
  const selectedCustomerOrders = useMemo(() => {
    if (!selectedCustomer) return [];
    const clean = selectedCustomer.phone.replace(/\D/g, "").slice(-10);
    return orders.filter((o) =>
      o.customerPhone.replace(/\D/g, "").includes(clean),
    );
  }, [orders, selectedCustomer]);

  // Real total feast value from actual confirmed orders
  const totalFeastValue = useMemo(() => {
    return selectedCustomerOrders
      .filter((o) => o.status === "Confirmed" || o.status === "Completed")
      .reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  }, [selectedCustomerOrders]);

  // Filtered customers list
  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        (c.address && c.address.toLowerCase().includes(q));

      if (!matchesSearch) return false;

      if (activeFilter === "confirmed") return c.confirmedCount > 0;
      if (activeFilter === "repeat")
        return c.confirmedCount > 1 || c.enquiryCount > 2;
      if (activeFilter === "enquiries")
        return c.enquiryCount > 0 && c.confirmedCount === 0;

      return true;
    });
  }, [customers, searchQuery, activeFilter]);

  // Real patrons count with zero mock fallbacks
  const totalPatronsCount = customers.length;
  const confirmedPatronsCount = useMemo(
    () => customers.filter((c) => c.confirmedCount > 0).length,
    [customers],
  );
  const repeatPatronsCount = useMemo(
    () =>
      customers.filter((c) => c.confirmedCount > 1 || c.enquiryCount > 2)
        .length,
    [customers],
  );
  const enquiryOnlyCount = useMemo(
    () =>
      customers.filter((c) => c.enquiryCount > 0 && c.confirmedCount === 0)
        .length,
    [customers],
  );

  // Handlers
  const handleSelectCustomer = (c: CustomerRecord) => {
    const clean = c.phone.replace(/\D/g, "").slice(-10);
    setSelectedPhone(clean);
    setViewState("detail");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleMobileCustomerClick = (c: CustomerRecord) => {
    const clean = c.phone.replace(/\D/g, "").slice(-10);
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      navigate(`/admin/customers/${clean}`);
    } else {
      handleSelectCustomer(c);
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      "Customer ID",
      "Name",
      "Phone",
      "Area / Address",
      "First Contacted",
      "Last Contacted",
      "Enquiries",
      "Confirmed Orders",
      "Notes",
    ];
    const rows = customers.map((c) => {
      const clean = c.phone.replace(/\D/g, "").slice(-10);
      const custId = `#CUST-${clean.slice(-4)}`;
      return [
        `"${custId}"`,
        `"${c.name}"`,
        `"${c.phone}"`,
        `"${c.address || "Mysuru"}"`,
        `"${c.firstContacted}"`,
        `"${c.lastContacted}"`,
        c.enquiryCount,
        c.confirmedCount,
        `"${(c.notes || "").replace(/"/g, '""')}"`,
      ].join(",");
    });
    const csvContent =
      "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `tks_customers_directory_${new Date().toISOString().split("T")[0]}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Customer directory exported successfully!");
  };

  // Add supervisor note
  const handleAddNote = () => {
    if (!newNoteInput.trim()) {
      toast.error("Please write a quick supervisor note first.");
      return;
    }

    const newNote: SupervisorNoteItem = {
      id: `note-${Date.now()}`,
      author: "K. Seshadri (Desk Supervisor)",
      timestamp: "Just Now",
      note: newNoteInput.trim(),
      borderClass: "border-l-primary",
    };

    setSupervisorNotes([newNote, ...supervisorNotes]);
    setNewNoteInput("");
    toast.success("Supervisor note added to patron profile.");
  };

  const handleAppendTag = (tagName: string) => {
    if (!newNoteInput.trim()) {
      setNewNoteInput(`[${tagName}] `);
    } else {
      setNewNoteInput(`${newNoteInput} · [${tagName}]`);
    }
  };

  // Handle Enquiry Submit
  const handleEnquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enquiryNotes.trim()) {
      toast.error("Please enter customer conversation notes.");
      return;
    }

    setIsSavingEnquiry(true);
    try {
      const cleanPhone = selectedCustomer.phone.replace(/\D/g, "").slice(-10);
      await recordEnquiry({
        phone: cleanPhone,
        name: selectedCustomer.name,
        eventDate: "2026-02-15",
        notes: `[${enquiryTopic}] ${enquiryExpected} · ${enquiryNotes.trim()}${isFollowUpChecked ? " (Follow-up needed)" : ""}`,
      });

      // Update local state
      setCustomers((prev) =>
        prev.map((c) => {
          if (c.phone.replace(/\D/g, "").slice(-10) === cleanPhone) {
            return {
              ...c,
              enquiryCount: c.enquiryCount + 1,
              lastContacted: new Date().toISOString().split("T")[0],
            };
          }
          return c;
        }),
      );

      toast.success(
        `✅ Enquiry recorded successfully! Matched with ${selectedCustomer.name} (+91 ${cleanPhone}).`,
      );
      setIsEnquiryModalOpen(false);
      setEnquiryNotes("");
      setViewState("detail");
    } catch (err) {
      console.error("Failed to record enquiry:", err);
      toast.error("Failed to save enquiry record.");
    } finally {
      setIsSavingEnquiry(false);
    }
  };

  return (
    <AdminAppShell>
      <div className="w-full px-4 sm:px-6 lg:px-8 2xl:px-12 py-6 space-y-6">
        {/* VIEW CANVAS WRAPPER */}
        <div id="content-canvas" className="w-full space-y-6">
          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-20 text-on-surface-variant gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-sm font-medium">
                Loading sacred patron directory...
              </p>
            </div>
          )}

          {!isLoading && (
            <>
              {/* ============================================================== */}
              {/* STATE 1: CUSTOMERS DIRECTORY (LIST & TABLE VIEW)               */}
              {/* ============================================================== */}
              {viewState === "directory" && (
                <div className="flex flex-col gap-6" id="view-directory">
                  {/* Page Header */}
                  <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-outline-variant/50">
                    <div>
                      <div className="flex items-center gap-2.5">
                        <h1 className="font-serif text-2xl sm:text-3xl text-primary font-bold">
                          Customers
                        </h1>
                        <span className="bg-secondary-fixed/50 text-on-secondary-fixed-variant text-xs font-semibold px-2.5 py-0.5 rounded-full border border-secondary/30">
                          {totalPatronsCount} Total Patrons
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleExportCSV}
                      className="self-start md:self-auto px-3.5 py-2 rounded-xl text-xs font-semibold text-on-surface-variant bg-surface-container-lowest border border-outline-variant/60 hover:text-primary hover:border-primary transition-all flex items-center gap-2 shadow-sm cursor-pointer"
                    >
                      <Download className="w-4 h-4 shrink-0" />
                      <span>Export Customer List (CSV)</span>
                    </button>
                  </div>

                  {/* Controls, Search, and Quick Filters */}
                  <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
                    {/* Search Bar */}
                    <div className="relative flex-1 max-w-xl">
                      <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-outline pointer-events-none" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by customer name or 10-digit mobile number..."
                        className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-surface-container-lowest border border-outline-variant/80 text-sm focus:border-primary focus:ring-1 focus:ring-primary shadow-sm placeholder:text-outline"
                      />
                    </div>

                    {/* Filter Chips */}
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setActiveFilter("all")}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                          activeFilter === "all"
                            ? "bg-primary text-white shadow-sm"
                            : "bg-surface-container-lowest text-on-surface-variant border border-outline-variant/60 hover:bg-surface-container-low"
                        }`}
                      >
                        All Customers ({totalPatronsCount})
                      </button>

                      <button
                        type="button"
                        onClick={() => setActiveFilter("confirmed")}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                          activeFilter === "confirmed"
                            ? "bg-primary text-white shadow-sm"
                            : "bg-surface-container-lowest text-on-surface-variant border border-outline-variant/60 hover:bg-surface-container-low"
                        }`}
                      >
                        With Confirmed Orders ({confirmedPatronsCount})
                      </button>

                      <button
                        type="button"
                        onClick={() => setActiveFilter("repeat")}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                          activeFilter === "repeat"
                            ? "bg-primary text-white shadow-sm"
                            : "bg-surface-container-lowest text-on-surface-variant border border-outline-variant/60 hover:bg-surface-container-low"
                        }`}
                      >
                        Repeat Patrons ({repeatPatronsCount})
                      </button>

                      <button
                        type="button"
                        onClick={() => setActiveFilter("enquiries")}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                          activeFilter === "enquiries"
                            ? "bg-primary text-white shadow-sm"
                            : "bg-surface-container-lowest text-on-surface-variant border border-outline-variant/60 hover:bg-surface-container-low"
                        }`}
                      >
                        Recent Enquiries ({enquiryOnlyCount})
                      </button>
                    </div>
                  </div>

                  {/* TABLE VIEW (Desktop, >= 1024px) */}
                  <div
                    id="table-view-section"
                    className="bg-surface-container-lowest rounded-2xl border border-outline-variant/70 overflow-hidden shadow-sm hidden lg:block"
                  >
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse min-w-[760px]">
                        <thead>
                          <tr className="bg-surface-container-low/70 border-b border-outline-variant/60 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                            <th className="py-3.5 px-4">Customer ID</th>
                            <th className="py-3.5 px-4">Patron Name</th>
                            <th className="py-3.5 px-4">Mobile &amp; Call</th>
                            <th className="py-3.5 px-4">Area (Mysuru)</th>
                            <th className="py-3.5 px-4">First Contact</th>
                            <th className="py-3.5 px-4">Last Contact</th>
                            <th className="py-3.5 px-4 text-center">
                              Enquiries
                            </th>
                            <th className="py-3.5 px-4 text-center">
                              Confirmed Orders
                            </th>
                            <th className="py-3.5 px-4 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-outline-variant/40 text-sm">
                          {filteredCustomers.map((c) => {
                            const cleanMobile = c.phone
                              .replace(/\D/g, "")
                              .slice(-10);
                            const custId = `#CUST-${cleanMobile.slice(-4)}`;
                            const areaName = c.address || "Mysuru Urban";
                            const initials = getInitials(c.name);
                            const isSelected =
                              selectedCustomer?.phone
                                .replace(/\D/g, "")
                                .slice(-10) === cleanMobile;

                            return (
                              <tr
                                key={c.phone}
                                onClick={() => handleMobileCustomerClick(c)}
                                className={`hover:bg-surface-container-low/60 transition-colors group cursor-pointer ${
                                  isSelected ? "bg-primary-fixed/20" : ""
                                }`}
                              >
                                <td className="py-4 px-4 font-mono font-semibold text-xs text-primary">
                                  {custId}
                                </td>

                                <td className="py-4 px-4">
                                  <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-full bg-primary-container text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
                                      {initials}
                                    </div>
                                    <div>
                                      <span className="font-semibold text-on-surface group-hover:text-primary transition-colors block">
                                        {c.name}
                                      </span>
                                    </div>
                                  </div>
                                </td>

                                <td className="py-4 px-4 whitespace-nowrap">
                                  <div className="flex items-center gap-2">
                                    <a
                                      className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center hover:bg-emerald-700 hover:text-white transition-all shrink-0"
                                      href={`tel:+91${cleanMobile}`}
                                      onClick={(e) => e.stopPropagation()}
                                      title={`Call +91 ${cleanMobile}`}
                                    >
                                      <Phone className="w-3.5 h-3.5" />
                                    </a>
                                    <span className="font-medium text-xs sm:text-sm">
                                      +91 {cleanMobile}
                                    </span>
                                  </div>
                                </td>

                                <td className="py-4 px-4 text-on-surface-variant text-xs sm:text-sm">
                                  {areaName}
                                </td>

                                <td className="py-4 px-4 text-xs text-on-surface-variant whitespace-nowrap">
                                  {c.firstContacted || "N/A"}
                                </td>

                                <td className="py-4 px-4 whitespace-nowrap">
                                  <span className="text-xs text-on-surface-variant">
                                    {c.lastContacted || "N/A"}
                                  </span>
                                </td>

                                <td className="py-4 px-4 text-center font-semibold text-xs">
                                  {c.enquiryCount}
                                </td>

                                <td className="py-4 px-4 text-center">
                                  {c.confirmedCount > 0 ? (
                                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                                      {c.confirmedCount} Confirmed
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-surface-container text-on-surface-variant border border-outline-variant/60">
                                      0 (Enquiry Only)
                                    </span>
                                  )}
                                </td>

                                <td className="py-4 px-4 text-right whitespace-nowrap">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleSelectCustomer(c);
                                    }}
                                    className="inline-flex items-center gap-1 text-xs font-bold text-primary group-hover:underline cursor-pointer"
                                  >
                                    <span>View Profile</span>
                                    <ArrowRight className="w-4 h-4" />
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Table Footer Pagination */}
                    <div className="p-3.5 bg-surface-container-lowest border-t border-outline-variant/50 flex flex-col sm:flex-row items-center justify-between text-xs text-on-surface-variant gap-2">
                      <div>
                        Showing{" "}
                        <strong>
                          {filteredCustomers.length > 0 ? 1 : 0} to{" "}
                          {filteredCustomers.length}
                        </strong>{" "}
                        of {totalPatronsCount} registered patrons
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          disabled
                          className="px-2.5 py-1 rounded border border-outline-variant/60 bg-surface-container-low text-outline disabled:opacity-50"
                        >
                          Previous
                        </button>
                        <button
                          type="button"
                          className="px-2.5 py-1 rounded border border-primary bg-primary text-white font-semibold"
                        >
                          1
                        </button>
                        <button
                          type="button"
                          disabled
                          className="px-2.5 py-1 rounded border border-outline-variant/60 bg-surface-container-low text-outline disabled:opacity-50"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* MOBILE CARD VIEW (Shown on mobile/tablet viewports < 1024px) */}
                  <div
                    id="mobile-cards-section"
                    className="flex flex-col gap-3.5 lg:hidden"
                  >
                    <div className="text-xs font-semibold text-secondary uppercase tracking-wider">
                      Mobile Card Format (Tap to view history)
                    </div>

                    {filteredCustomers.map((c) => {
                      const cleanMobile = c.phone.replace(/\D/g, "").slice(-10);
                      const custId = `#CUST-${cleanMobile.slice(-4)}`;
                      const areaName = c.address || "Mysuru Urban";
                      const isSelected =
                        selectedCustomer?.phone
                          .replace(/\D/g, "")
                          .slice(-10) === cleanMobile;

                      return (
                        <div
                          key={c.phone}
                          onClick={() => handleMobileCustomerClick(c)}
                          className={`p-4 rounded-2xl bg-surface-container-lowest border shadow-sm flex flex-col gap-3 cursor-pointer ${
                            isSelected
                              ? "border-2 border-primary/40"
                              : "border-outline-variant/60"
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <span className="text-xs font-mono font-bold text-primary">
                                {custId}
                              </span>
                              <h3 className="font-serif text-lg text-on-surface font-bold">
                                {c.name}
                              </h3>
                              <p className="text-xs text-on-surface-variant">
                                {areaName}
                              </p>
                            </div>
                            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                              {c.confirmedCount > 0
                                ? `${c.confirmedCount} Confirmed`
                                : "Enquiry Only"}
                            </span>
                          </div>

                          <div className="flex items-center justify-between py-2 border-y border-outline-variant/40 text-xs">
                            <div>
                              <span className="text-on-surface-variant block">
                                First Contact
                              </span>
                              <span className="font-semibold text-on-surface">
                                {c.firstContacted || "N/A"}
                              </span>
                            </div>
                            <div>
                              <span className="text-on-surface-variant block">
                                Last Contact
                              </span>
                              <span className="font-semibold text-primary">
                                {c.lastContacted || "N/A"}
                              </span>
                            </div>
                            <div>
                              <span className="text-on-surface-variant block">
                                Enquiries
                              </span>
                              <span className="font-semibold text-on-surface">
                                {c.enquiryCount} total
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 pt-1">
                            <a
                              href={`tel:+91${cleanMobile}`}
                              onClick={(e) => e.stopPropagation()}
                              className="flex-1 py-2 rounded-xl bg-emerald-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-sm"
                            >
                              <Phone className="w-4 h-4" />
                              <span>Call +91 {cleanMobile}</span>
                            </a>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelectCustomer(c);
                              }}
                              className="px-3.5 py-2 rounded-xl bg-surface-container-high text-primary font-semibold text-xs flex items-center justify-center"
                            >
                              <span>View Details →</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ============================================================== */}
              {/* STATE 2: CUSTOMER DETAIL PROFILE                               */}
              {/* ============================================================== */}
              {viewState === "detail" && (
                <div className="flex flex-col gap-6" id="view-detail">
                  {/* Back Link */}
                  <div>
                    <button
                      type="button"
                      onClick={() => setViewState("directory")}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:text-on-primary-fixed-variant bg-surface-container px-3 py-1.5 rounded-lg border border-outline-variant/60 transition-all shadow-sm cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>← Back to Customers Directory</span>
                    </button>
                  </div>

                  {/* TOP SUMMARY CARD (Rich Heritage Card with Warm Ivory & Crimson Trim) */}
                  <div className="p-6 md:p-8 rounded-3xl bg-surface-container-lowest border-2 border-outline-variant/70 shadow-md relative overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary via-secondary to-primary"></div>

                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                      {/* Left Profile Identity */}
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-primary via-primary-container to-primary text-white flex items-center justify-center font-bold text-2xl sm:text-3xl shrink-0 shadow-lg shadow-primary/20 border-2 border-secondary-fixed">
                          {getInitials(selectedCustomer?.name || "Patron")}
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-surface-container text-primary border border-outline-variant/60">
                              #CUST-
                              {(selectedCustomer?.phone || "")
                                .replace(/\D/g, "")
                                .slice(-4) || "0000"}
                            </span>
                            {selectedCustomer &&
                            selectedCustomer.confirmedCount > 0 ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                                <span>
                                  Confirmed Patron (
                                  {selectedCustomer.confirmedCount}{" "}
                                  {selectedCustomer.confirmedCount === 1
                                    ? "Banquet"
                                    : "Banquets"}
                                  )
                                </span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-surface-container text-on-surface-variant border border-outline-variant/60">
                                <span>
                                  Enquiry Patron (
                                  {selectedCustomer?.enquiryCount || 0}{" "}
                                  {selectedCustomer?.enquiryCount === 1
                                    ? "Enquiry"
                                    : "Enquiries"}
                                  )
                                </span>
                              </span>
                            )}
                          </div>
                          <h2 className="font-serif text-2xl sm:text-3xl text-primary font-bold tracking-tight">
                            {selectedCustomer?.name || "Valued Patron"}
                          </h2>
                          <div className="flex items-center gap-1.5 text-xs text-on-surface-variant mt-2">
                            <MapPin className="w-4 h-4 text-outline shrink-0" />
                            <span>
                              {selectedCustomer?.address ||
                                "Address not specified"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Quick Communication Actions */}
                      <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-center">
                        {selectedCustomer && (
                          <>
                            <a
                              href={`tel:+91${selectedCustomer.phone.replace(/\D/g, "").slice(-10)}`}
                              className="px-4 py-2.5 rounded-xl bg-emerald-700 text-white font-semibold text-xs flex items-center gap-2 shadow-sm hover:opacity-95 transition-all"
                            >
                              <Phone className="w-4 h-4" />
                              <span>
                                Tap to Call (+91{" "}
                                {selectedCustomer.phone
                                  .replace(/\D/g, "")
                                  .slice(-10)}
                                )
                              </span>
                            </a>

                            <a
                              href={`https://wa.me/91${selectedCustomer.phone.replace(/\D/g, "").slice(-10)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-4 py-2.5 rounded-xl bg-emerald-100 text-emerald-800 border border-emerald-300 font-semibold text-xs flex items-center gap-2 hover:bg-emerald-200 transition-all"
                            >
                              <MessageSquare className="w-4 h-4" />
                              <span>WhatsApp</span>
                            </a>
                          </>
                        )}

                        <button
                          type="button"
                          onClick={() => setIsEnquiryModalOpen(true)}
                          className="px-4 py-2.5 rounded-xl bg-primary-container text-white font-semibold text-xs flex items-center gap-2 shadow-md shadow-primary/25 hover:bg-primary transition-all cursor-pointer"
                        >
                          <FilePlus className="w-4 h-4" />
                          <span>Record General Enquiry</span>
                        </button>
                      </div>
                    </div>

                    {/* KEY STATISTICS CHIPS */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mt-6 pt-6 border-t border-outline-variant/50">
                      <div className="p-3.5 rounded-2xl bg-surface-container-low border border-outline-variant/50">
                        <span className="text-xs text-on-surface-variant block mb-1">
                          First Contacted
                        </span>
                        <span className="font-serif text-lg sm:text-xl text-on-surface font-bold block">
                          {selectedCustomer?.firstContacted || "N/A"}
                        </span>
                        <span className="text-[11px] text-outline font-medium">
                          Initial interaction
                        </span>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-surface-container-low border border-outline-variant/50">
                        <span className="text-xs text-on-surface-variant block mb-1">
                          Last Contacted
                        </span>
                        <span className="font-serif text-lg sm:text-xl text-primary font-bold block">
                          {selectedCustomer?.lastContacted || "N/A"}
                        </span>
                        <span className="text-[11px] text-primary font-semibold">
                          Latest activity
                        </span>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-surface-container-low border border-outline-variant/50">
                        <span className="text-xs text-on-surface-variant block mb-1">
                          Total Enquiries
                        </span>
                        <span className="font-serif text-lg sm:text-xl text-on-surface font-bold block">
                          {selectedCustomer?.enquiryCount || 0} Enquiries
                        </span>
                        <span className="text-[11px] text-outline font-medium">
                          Banquet inquiries
                        </span>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200">
                        <span className="text-xs text-emerald-800 block mb-1 font-medium">
                          Confirmed Orders
                        </span>
                        <span className="font-serif text-lg sm:text-xl text-emerald-900 font-bold block">
                          {selectedCustomer?.confirmedCount || 0} Banquets
                        </span>
                        <span className="text-[11px] font-semibold text-emerald-700">
                          ₹{totalFeastValue.toLocaleString("en-IN")} total feast
                          value
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* TWO-COLUMN DETAILS SECTION */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    {/* ================= SECTION A: ENQUIRY & ORDER HISTORY (7 Cols) ================= */}
                    <div className="lg:col-span-7 flex flex-col gap-4">
                      <div className="flex items-center justify-between pb-1 border-b border-outline-variant/50">
                        <div className="flex items-center gap-2">
                          <Scroll className="w-5 h-5 text-primary shrink-0" />
                          <h3 className="font-serif text-xl text-primary font-bold">
                            Enquiry &amp; Order History
                          </h3>
                        </div>
                        <span className="text-xs text-on-surface-variant font-medium">
                          {selectedCustomerOrders.length}{" "}
                          {selectedCustomerOrders.length === 1
                            ? "Record"
                            : "Records"}
                        </span>
                      </div>

                      {/* TIMELINE CARDS - 100% Real from Database */}
                      <div className="flex flex-col gap-4">
                        {selectedCustomerOrders.length === 0 ? (
                          <div className="p-8 text-center bg-surface-container-low rounded-2xl border border-outline-variant/30 flex flex-col items-center justify-center gap-2">
                            <Scroll className="w-8 h-8 text-outline" />
                            <p className="text-sm font-semibold text-on-surface">
                              No previous banquet orders or enquiries
                            </p>
                            <p className="text-xs text-on-surface-variant">
                              Click &quot;Record General Enquiry&quot; above to
                              log an interaction for this patron.
                            </p>
                          </div>
                        ) : (
                          selectedCustomerOrders.map((ord) => (
                            <div
                              key={ord.id}
                              className="p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/60 shadow-sm hover:border-primary/40 transition-all flex flex-col gap-3"
                            >
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary text-white">
                                    {ord.source || "Order"}
                                  </span>
                                  <span className="text-xs font-mono font-bold text-primary">
                                    #{ord.id}
                                  </span>
                                </div>
                                <span
                                  className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                                    ord.status === "Confirmed" ||
                                    ord.status === "Completed"
                                      ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                      : ord.status === "Cancelled"
                                        ? "bg-rose-50 text-rose-800 border-rose-200"
                                        : "bg-amber-50 text-amber-900 border-amber-300"
                                  }`}
                                >
                                  {ord.status}
                                </span>
                              </div>

                              <div className="flex items-start justify-between gap-4">
                                <div>
                                  <h4 className="font-serif text-base font-bold text-on-surface">
                                    {ord.eventType || "Catering Banquet"}
                                  </h4>
                                  <p className="text-xs text-on-surface-variant mt-0.5">
                                    {ord.eventDate
                                      ? `Feast Date: ${ord.eventDate}`
                                      : "Date unconfirmed"}{" "}
                                    · {ord.guestCount} plates
                                  </p>
                                  {ord.venueAddress && (
                                    <p className="text-xs text-outline mt-0.5 flex items-center gap-1">
                                      <MapPin className="w-3 h-3 shrink-0" />
                                      <span>{ord.venueAddress}</span>
                                    </p>
                                  )}
                                </div>
                                <div className="text-right shrink-0">
                                  <span className="font-mono text-base font-bold text-primary block">
                                    ₹
                                    {(ord.totalAmount || 0).toLocaleString(
                                      "en-IN",
                                    )}
                                  </span>
                                  {ord.perPlateTotal > 0 && (
                                    <span className="text-[11px] text-on-surface-variant">
                                      ₹{ord.perPlateTotal} / plate
                                    </span>
                                  )}
                                </div>
                              </div>

                              {ord.notes && (
                                <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/40 text-xs text-on-surface-variant">
                                  <span className="font-bold text-primary block mb-0.5">
                                    Special Instructions / Notes:
                                  </span>
                                  {ord.notes}
                                </div>
                              )}

                              {ord.items && ord.items.length > 0 && (
                                <div className="text-xs text-on-surface-variant flex flex-wrap gap-1">
                                  <span className="font-semibold text-on-surface mr-1">
                                    Menu ({ord.items.length} dishes):
                                  </span>
                                  {ord.items.slice(0, 8).map((it, idx) => (
                                    <span
                                      key={it.id || idx}
                                      className="px-2 py-0.5 rounded bg-surface-container text-[11px]"
                                    >
                                      {it.name}
                                    </span>
                                  ))}
                                  {ord.items.length > 8 && (
                                    <span className="text-[11px] text-outline self-center">
                                      +{ord.items.length - 8} more
                                    </span>
                                  )}
                                </div>
                              )}

                              <div className="pt-2 border-t border-outline-variant/30 flex justify-end">
                                <Link
                                  to={`/admin/orders/${ord.id}`}
                                  className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                                >
                                  <span>Open Order #{ord.id}</span>
                                  <ArrowRight className="w-3.5 h-3.5" />
                                </Link>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* ================= SECTION B: CUSTOMER NOTES & PREFERENCES (5 Cols) ================= */}
                    <div className="lg:col-span-5 flex flex-col gap-4">
                      <div className="flex items-center justify-between pb-1 border-b border-outline-variant/50">
                        <div className="flex items-center gap-2">
                          <FileText className="w-5 h-5 text-secondary shrink-0" />
                          <h3 className="font-serif text-xl text-primary font-bold">
                            Customer Notes &amp; Preferences
                          </h3>
                        </div>
                      </div>

                      {/* Patron Recorded Notes */}
                      {selectedCustomer?.notes ? (
                        <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/60">
                          <span className="text-xs font-bold text-on-surface uppercase tracking-wider block mb-1.5">
                            Recorded Patron Notes &amp; Preferences
                          </span>
                          <p className="text-xs text-on-surface leading-relaxed">
                            {selectedCustomer.notes}
                          </p>
                        </div>
                      ) : null}

                      {/* Add Supervisor Note Form Card */}
                      <div className="p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/70 shadow-sm flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                          <label
                            className="text-xs font-bold text-primary flex items-center gap-1.5"
                            htmlFor="new-note-text"
                          >
                            <MessageSquarePlus className="w-4 h-4" />
                            <span>Add Supervisor Note / Kitchen Alert</span>
                          </label>
                          <span className="text-[11px] text-outline">
                            Visible to Desk &amp; Cooks
                          </span>
                        </div>

                        <textarea
                          id="new-note-text"
                          value={newNoteInput}
                          onChange={(e) => setNewNoteInput(e.target.value)}
                          placeholder="e.g. Prefers less sweet Gasagase Payasa, daughter's in-laws from Melkote..."
                          rows={3}
                          className="w-full text-xs sm:text-sm p-3 rounded-xl bg-surface-container-low border border-outline-variant/80 focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-outline"
                        />

                        {/* Quick Tags to insert */}
                        <div className="flex flex-wrap items-center gap-1 text-[11px] text-outline">
                          <span className="font-medium mr-1">Quick Tags:</span>
                          <button
                            type="button"
                            onClick={() => handleAppendTag("Strictly Satvik")}
                            className="px-2 py-0.5 rounded bg-surface-container hover:bg-surface-container-high text-on-surface-variant transition-colors cursor-pointer"
                          >
                            Strictly Satvik
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAppendTag("Extra Ghee")}
                            className="px-2 py-0.5 rounded bg-surface-container hover:bg-surface-container-high text-on-surface-variant transition-colors cursor-pointer"
                          >
                            Extra Ghee
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAppendTag("Melkote Style")}
                            className="px-2 py-0.5 rounded bg-surface-container hover:bg-surface-container-high text-on-surface-variant transition-colors cursor-pointer"
                          >
                            Melkote Style
                          </button>
                        </div>

                        <div className="flex justify-end pt-1">
                          <button
                            type="button"
                            onClick={handleAddNote}
                            className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary-container shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>Add Note</span>
                          </button>
                        </div>
                      </div>

                      {/* Timestamped Notes Feed */}
                      <div className="flex flex-col gap-3" id="notes-feed">
                        {supervisorNotes.length === 0 ? (
                          <div className="p-4 rounded-2xl bg-surface-container-lowest border border-outline-variant/60 text-xs text-on-surface-variant text-center">
                            No supervisor notes logged yet. Use the form above
                            to add an alert.
                          </div>
                        ) : (
                          supervisorNotes.map((note) => (
                            <div
                              key={note.id}
                              className={`p-4 rounded-2xl bg-surface-container-lowest border-l-4 ${note.borderClass} border border-outline-variant/60 shadow-sm flex flex-col gap-1.5`}
                            >
                              <div className="flex items-center justify-between text-xs">
                                <span
                                  className={`font-bold ${note.borderClass.includes("primary") ? "text-primary" : "text-secondary"}`}
                                >
                                  {note.author}
                                </span>
                                <span className="text-outline">
                                  {note.timestamp}
                                </span>
                              </div>
                              <p className="text-xs text-on-surface leading-relaxed">
                                {note.note}
                              </p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ============================================================== */}
      {/* STATE 3: RECORD GENERAL ENQUIRY SHEET / MODAL                  */}
      {/* ============================================================== */}
      {isEnquiryModalOpen && (
        <div
          id="enquiry-modal"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity"
        >
          <div className="bg-surface-container-lowest max-w-xl w-full rounded-3xl border-2 border-outline-variant shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-surface-container-low px-6 py-4 border-b border-outline-variant/60 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-full bg-primary-container text-white flex items-center justify-center font-bold text-sm">
                  <FileEdit className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="font-serif text-xl text-primary font-bold">
                    Record General Enquiry
                  </h3>
                  <p className="text-xs text-on-surface-variant">
                    For phone calls, hall checks, or tentative dates without an
                    immediate order.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEnquiryModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form
              onSubmit={handleEnquirySubmit}
              className="p-6 flex flex-col gap-4"
            >
              {/* Pre-filled Patron Badge */}
              <div className="p-3.5 rounded-xl bg-surface-container border border-outline-variant/60 flex items-center justify-between text-xs">
                <div>
                  <span className="text-outline block text-[11px]">
                    Matched Customer:
                  </span>
                  <span className="font-bold text-on-surface text-sm">
                    {selectedCustomer.name}
                  </span>
                </div>
                <span className="font-mono font-bold text-primary bg-surface-container-lowest px-2.5 py-1 rounded border border-outline-variant/60">
                  +91 {selectedCustomer.phone.replace(/\D/g, "").slice(-10)}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Date & Time */}
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">
                    Date &amp; Time of Call / Visit
                  </label>
                  <input
                    type="text"
                    readOnly
                    defaultValue={new Date().toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                    className="w-full text-xs rounded-xl bg-surface-container-low border border-outline-variant/80 p-2.5 focus:border-primary focus:ring-1 focus:ring-primary font-medium"
                  />
                </div>

                {/* Enquiry Topic */}
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">
                    Enquiry Topic / Tentative Occasion
                  </label>
                  <CustomSelect
                    value={enquiryTopic}
                    onChange={(val) => setEnquiryTopic(val)}
                    options={[
                      "Tentative Wedding (Muhurtham)",
                      "Sashti Poorthi (60th Birthday)",
                      "Griha Pravesh (House Warming)",
                      "Upanayana (Munji)",
                      "Filter Kaapi & Tiffin Only",
                      "General Menu Query",
                      "Other Event",
                    ]}
                    sortAlphabetical={true}
                  />
                </div>
              </div>

              {/* Expected Date / Plate Range */}
              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">
                  Expected Month / Date &amp; Approx Plates
                </label>
                <input
                  type="text"
                  value={enquiryExpected}
                  onChange={(e) => setEnquiryExpected(e.target.value)}
                  placeholder="e.g. Early Feb 2026, 120 plates"
                  className="w-full text-xs rounded-xl bg-surface-container-low border border-outline-variant/80 p-2.5 focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>

              {/* Conversation Note */}
              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">
                  Conversation Note / Customer Request{" "}
                  <span className="text-error font-bold">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={enquiryNotes}
                  onChange={(e) => setEnquiryNotes(e.target.value)}
                  placeholder="Write what the customer discussed or requested (e.g. checking hall near Jayalakshmipuram, inquired regarding Payasa options)..."
                  className="w-full text-xs rounded-xl bg-surface-container-low border border-outline-variant/80 p-3 focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>

              {/* Follow-up Needed Checkbox */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-surface-container-low border border-outline-variant/50">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-on-surface">
                  <input
                    type="checkbox"
                    checked={isFollowUpChecked}
                    onChange={(e) => setIsFollowUpChecked(e.target.checked)}
                    className="rounded text-primary focus:ring-primary border-outline-variant w-4 h-4 cursor-pointer"
                  />
                  <span>Supervisor Follow-up Call Needed?</span>
                </label>
                <span className="text-xs font-semibold text-primary bg-surface-container-lowest px-2 py-0.5 rounded border border-outline-variant/60">
                  Remind:{" "}
                  {new Date(Date.now() + 7 * 86400000).toLocaleDateString(
                    "en-IN",
                    { day: "numeric", month: "short" },
                  )}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-outline-variant/40 mt-1">
                <button
                  type="button"
                  onClick={() => setIsEnquiryModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-on-surface-variant hover:bg-surface-container transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingEnquiry}
                  className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-primary hover:bg-primary-container shadow-md shadow-primary/20 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>
                    {isSavingEnquiry ? "Saving..." : "Save Enquiry Record"}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminAppShell>
  );
};

export default AdminCustomersPage;
