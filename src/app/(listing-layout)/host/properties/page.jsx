"use client";

import {
    changePropertyStatus,
    deleteProperty,
    getAllProperties,
    getDraftProperties,
    resetCurrentProperty,
    togglePropertyActive,
} from "@/redux/features/property/propertySlice";
import Link, { useRouter } from "expo-router";
import { Check, Edit, Plus, Search, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";

export default function Listing() {
  const dispatch = useDispatch();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("published");
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [statusLoading, setStatusLoading] = useState(null);
  const [toggleLoading, setToggleLoading] = useState(null);
  const [reviewLoading, setReviewLoading] = useState(null);

  const handleToggleActive = async (property) => {
    try {
      setToggleLoading(property._id);
      const newStatus = !property.isActive;

      const response = await dispatch(
        togglePropertyActive({ id: property._id, isActive: newStatus }),
      ).unwrap();

      // The backend returns a specific message if it scheduled the inactivation
      if (response.message) {
        toast.success(response.message, { duration: 5000 });
      } else {
        toast.success(`Property is now ${newStatus ? "active" : "inactive"}`);
      }

      // Refresh list to show updated scheduledInactive flag if applicable
      dispatch(getAllProperties());
    } catch (error) {
      console.error("Toggle active failed:", error);
      toast.error(
        "Failed to change active status: " + (error.message || "Unknown error"),
      );
    } finally {
      setToggleLoading(null);
    }
  };
  const [showReviewPopup, setShowReviewPopup] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [reviewAction, setReviewAction] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");

  // 1. Add Search State
  const [searchQuery, setSearchQuery] = useState("");

  const { properties, isLoading, error, user } = useSelector((state) => ({
    properties: state.property.properties,
    draftProperties: state.property.draftProperties,
    isLoading: state.property.isLoading,
    error: state.property.error,
    user: state.auth.user,
  }));

  const isAdmin = user?.role === "admin";

  useEffect(() => {
    dispatch(getAllProperties());
    dispatch(getDraftProperties());
  }, [dispatch]);

  useEffect(() => {
    if (properties && properties.length > 0) {
      const hasPending = properties.some((p) => p.status === "pending");
      if (hasPending) {
        setActiveTab("pending");
      }
    }
  }, [properties]);

  const publishedProperties =
    properties?.filter((p) => p.status === "published") || [];
  const draftProperties_filtered =
    properties?.filter((p) => p.status === "draft") || [];
  const pendingProperties =
    properties?.filter((p) => p.status === "pending") || [];
  const rejectedProperties =
    properties?.filter((p) => p.status === "rejected") || [];
  const pendingChangesProperties =
    properties?.filter((p) => p.status === "pending_changes") || [];

  const handleCreateNew = () => {
    dispatch(resetCurrentProperty());
    sessionStorage.setItem("createNew", "true");
    router.push("/host/onboarding/new");
  };

  const handleDelete = async (id) => {
    if (
      window.confirm(
        "Are you sure you want to delete this property? This action cannot be undone.",
      )
    ) {
      try {
        setDeleteLoading(id);
        await dispatch(deleteProperty(id)).unwrap();
        dispatch(getAllProperties());
        dispatch(getDraftProperties());
        toast.success("Property deleted successfully!");
      } catch (error) {
        console.error("Delete failed:", error);
        toast.error(
          "Failed to delete property: " + (error.message || "Unknown error"),
        );
      } finally {
        setDeleteLoading(null);
      }
    }
  };

  const handleReviewClick = (property, action) => {
    setSelectedProperty(property);
    setReviewAction(action);
    setShowReviewPopup(true);
  };

  const handleReviewConfirm = async () => {
    if (!selectedProperty || !reviewAction) return;

    // Prevent submitting without a reason if rejecting
    if (reviewAction === "reject" && !rejectionReason.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }

    try {
      setReviewLoading(selectedProperty._id);
      const newStatus = reviewAction === "approve" ? "published" : "rejected";

      // Update the payload to include the rejectionReason
      const payload = {
        id: selectedProperty._id,
        status: newStatus,
        rejectionReason:
          reviewAction === "reject" ? rejectionReason : undefined,
      };

      await dispatch(changePropertyStatus(payload)).unwrap();
      dispatch(getAllProperties());
      dispatch(getDraftProperties());
      toast.success(
        `Property ${reviewAction === "approve" ? "approved" : "rejected"} successfully!`,
      );
    } catch (error) {
      console.error("Review failed:", error);
      toast.error(
        `Failed to ${reviewAction} property: ` +
          (error.message || "Unknown error"),
      );
    } finally {
      setReviewLoading(null);
      setShowReviewPopup(false);
      setSelectedProperty(null);
      setReviewAction("");
      setRejectionReason(""); // Reset the reason
    }
  };

  const handleReviewCancel = () => {
    setShowReviewPopup(false);
    setSelectedProperty(null);
    setReviewAction("");
    setRejectionReason(""); // Reset the reason
  };

  const statusOptions = [
    { value: "draft", label: "Draft" },
    { value: "pending", label: "Pending" },
    { value: "published", label: "Published" },
    { value: "rejected", label: "Rejected" },
    { value: "pending_changes", label: "Pending Changes" },
  ];

  const handleStatusChange = async (property, newStatus) => {
    if (!property || !newStatus) return;

    // 1. If Admin selects "Rejected" from dropdown, open the popup with the text box!
    if (newStatus === "rejected") {
      setSelectedProperty(property);
      setReviewAction("reject");
      setShowReviewPopup(true);
      return; // Stop here, let the popup handle the API call
    }

    // 2. If Admin selects "Published" from dropdown, open the approve popup
    if (newStatus === "published") {
      setSelectedProperty(property);
      setReviewAction("approve");
      setShowReviewPopup(true);
      return; // Stop here, let the popup handle the API call
    }

    // 3. For all other statuses (draft, pending, pending_changes), use standard confirm
    const confirmed = window.confirm(
      `Change status of "${property.placeName}" to "${newStatus}"?`,
    );
    if (!confirmed) return;

    try {
      setStatusLoading(property._id);
      await dispatch(
        changePropertyStatus({ id: property._id, status: newStatus }),
      ).unwrap();
      dispatch(getAllProperties());
      dispatch(getDraftProperties());
      toast.success(`Status updated to ${newStatus} successfully!`);
    } catch (error) {
      console.error("Status update failed:", error);
      toast.error(
        "Failed to update status: " + (error.message || "Unknown error"),
      );
    } finally {
      setStatusLoading(null);
    }
  };

  const tabs = [
    { key: "published", label: "Published", count: publishedProperties.length },
    { key: "draft", label: "Draft", count: draftProperties_filtered.length },
    {
      key: "pending",
      label: "Pending Review",
      count: pendingProperties.length,
    },
    { key: "rejected", label: "Rejected", count: rejectedProperties.length },
    {
      key: "pending_changes",
      label: "Pending Changes",
      count: pendingChangesProperties.length,
    },
  ];

  const getCurrentProperties = () => {
    switch (activeTab) {
      case "published":
        return publishedProperties;
      case "draft":
        return draftProperties_filtered;
      case "pending":
        return pendingProperties;
      case "rejected":
        return rejectedProperties;
      case "pending_changes":
        return pendingChangesProperties;
      default:
        return [];
    }
  };

  // 2. Logic to filter properties based on search query
  const getFilteredProperties = () => {
    const currentList = getCurrentProperties();
    if (!searchQuery) return currentList;

    return currentList.filter((property) => {
      const query = searchQuery.toLowerCase();
      const name = property.placeName?.toLowerCase() || "";
      const type = property.propertyType?.toLowerCase() || "";
      const city = property.location?.city?.toLowerCase() || "";
      const state = property.location?.state?.toLowerCase() || "";

      return (
        name.includes(query) ||
        type.includes(query) ||
        city.includes(query) ||
        state.includes(query)
      );
    });
  };

  const getEmptyMessage = () => {
    if (searchQuery) return "No properties match your search.";
    switch (activeTab) {
      case "published":
        return "No published properties found.";
      case "draft":
        return "No draft properties found.";
      case "pending":
        return "No properties pending review.";
      case "rejected":
        return "No rejected properties found.";
      default:
        return "No properties found.";
    }
  };

  const renderPropertyTable = (propertyList) => (
    <>
      {/* MOBILE VIEW (Cards instead of Table) */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {propertyList.map((property) => (
          <div
            key={property._id}
            className="rounded-lg border bg-white p-4 shadow-sm flex flex-col gap-3"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-gray-900">
                  {property.placeName}
                </h3>
                <p className="text-sm text-gray-500">
                  {property.location?.city}, {property.location?.state}
                </p>
                <p className="text-xs font-medium text-gray-400 mt-1">
                  {property.propertyType}
                </p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span
                  className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                    property.status === "published"
                      ? "bg-green-100 text-green-800"
                      : property.status === "draft"
                        ? "bg-yellow-100 text-yellow-800"
                        : property.status === "pending"
                          ? "bg-orange-100 text-orange-800"
                          : property.status === "rejected"
                            ? "bg-red-100 text-red-800"
                            : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {property.status}
                </span>

                {property.status === "published" && (
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] text-gray-500 font-medium">
                      {property.isActive ? "Active" : "Inactive"}
                    </span>
                    <button
                      onClick={() => handleToggleActive(property)}
                      disabled={toggleLoading === property._id}
                      className={`relative inline-flex h-4 w-7 items-center rounded-full transition-colors ${
                        property.isActive ? "bg-[#1035ac]" : "bg-gray-300"
                      } ${toggleLoading === property._id ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                    >
                      <span
                        className={`inline-block h-2 w-2 transform rounded-full bg-white transition-transform ${
                          property.isActive ? "translate-x-4" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>
                )}

                {property.scheduledInactive && property.inactiveFrom && (
                  <span className="text-[10px] bg-red-50 text-red-600 px-2 py-0.5 rounded border border-red-100 font-medium whitespace-normal max-w-[150px] text-right mt-1">
                    Scheduled Inactive from{" "}
                    {new Date(property.inactiveFrom).toLocaleDateString()}
                  </span>
                )}

                {isAdmin && property.status === "pending" && (
                  <div className="flex space-x-2 mt-1">
                    <button
                      className="p-1 rounded bg-green-50 text-green-600 hover:bg-green-100 disabled:opacity-50"
                      onClick={() => handleReviewClick(property, "approve")}
                      disabled={reviewLoading === property._id}
                    >
                      {reviewLoading === property._id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                      ) : (
                        <Check className="h-4 w-4" />
                      )}
                    </button>
                    <button
                      className="p-1 rounded bg-red-50 text-red-600 hover:bg-red-100 disabled:opacity-50"
                      onClick={() => handleReviewClick(property, "reject")}
                      disabled={reviewLoading === property._id}
                    >
                      {reviewLoading === property._id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                      ) : (
                        <X className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {isAdmin && (
              <div className="flex items-center justify-between border-t pt-3 mt-1">
                <span className="text-sm font-medium text-gray-600">
                  Change Status:
                </span>
                <div className="flex items-center gap-2">
                  <select
                    value={property.status}
                    onChange={(e) =>
                      handleStatusChange(property, e.target.value)
                    }
                    disabled={
                      statusLoading === property._id ||
                      reviewLoading === property._id
                    }
                    className="rounded-md border border-gray-300 px-2 py-1 text-sm bg-white"
                  >
                    {statusOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  {statusLoading === property._id && (
                    <span className="inline-block animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-gray-600"></span>
                  )}
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-4 border-t pt-3 mt-1">
              <Link
                href={`/host/onboarding/${property._id}`}
                className="flex items-center text-sm font-medium text-green-600 hover:text-green-900"
              >
                <Edit className="h-4 w-4 mr-1" /> Edit
              </Link>
              <button
                className="flex items-center text-sm font-medium text-red-600 hover:text-red-900 disabled:opacity-50"
                onClick={() => handleDelete(property._id)}
                disabled={deleteLoading === property._id}
              >
                {deleteLoading === property._id ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-red-600 mr-1"></div>
                ) : (
                  <Trash2 className="h-4 w-4 mr-1" />
                )}
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* DESKTOP VIEW (Standard Table) */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Property Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Location
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Status
              </th>
              {isAdmin && (
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Status Update
                </th>
              )}
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {propertyList.map((property) => (
              <tr key={property._id} className="hover:bg-gray-50">
                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                  {property.placeName}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm">
                  {property.propertyType}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm">
                  {property.location?.city}, {property.location?.state}
                </td>

                {/* STATUS COLUMN */}
                <td className="whitespace-nowrap px-6 py-4 text-sm flex flex-col items-start gap-2">
                  <div className="flex space-x-2 items-center">
                    <span
                      className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                        property.status === "published"
                          ? "bg-green-100 text-green-800"
                          : property.status === "draft"
                            ? "bg-yellow-100 text-yellow-800"
                            : property.status === "pending"
                              ? "bg-orange-100 text-orange-800"
                              : property.status === "rejected"
                                ? "bg-red-100 text-red-800"
                                : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {property.status}
                    </span>

                    {isAdmin && property.status === "pending" && (
                      <>
                        <button
                          className="text-green-600 hover:text-green-900 disabled:opacity-50 disabled:cursor-not-allowed ml-2"
                          title="Approve Property"
                          onClick={() => handleReviewClick(property, "approve")}
                          disabled={reviewLoading === property._id}
                        >
                          {reviewLoading === property._id ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-green-600"></div>
                          ) : (
                            <Check className="h-5 w-5" />
                          )}
                        </button>
                        <button
                          className="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Reject Property"
                          onClick={() => handleReviewClick(property, "reject")}
                          disabled={reviewLoading === property._id}
                        >
                          {reviewLoading === property._id ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-red-600"></div>
                          ) : (
                            <X className="h-5 w-5" />
                          )}
                        </button>
                      </>
                    )}
                  </div>

                  {property.status === "published" && (
                    <div className="flex items-center gap-2 mt-1">
                      <button
                        onClick={() => handleToggleActive(property)}
                        disabled={toggleLoading === property._id}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                          property.isActive ? "bg-[#1035ac]" : "bg-gray-300"
                        } ${toggleLoading === property._id ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                      >
                        <span
                          className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                            property.isActive
                              ? "translate-x-5"
                              : "translate-x-1"
                          }`}
                        />
                      </button>
                      <span className="text-xs text-gray-500 font-medium">
                        {property.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                  )}

                  {property.scheduledInactive && property.inactiveFrom && (
                    <span className="text-[10px] bg-red-50 text-red-600 px-2 py-0.5 rounded border border-red-100 font-medium whitespace-normal max-w-[200px]">
                      Scheduled Inactive from{" "}
                      {new Date(property.inactiveFrom).toLocaleDateString()}
                    </span>
                  )}
                </td>

                {/* STATUS UPDATE COLUMN (ADMIN ONLY) */}
                {isAdmin && (
                  <td className="whitespace-nowrap px-6 py-4 text-sm space-x-2">
                    <div>
                      <select
                        value={property.status}
                        onChange={(e) =>
                          handleStatusChange(property, e.target.value)
                        }
                        disabled={
                          statusLoading === property._id ||
                          reviewLoading === property._id
                        }
                        className="rounded-md border px-2 py-1 text-sm"
                        title="Change status"
                      >
                        {statusOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                      {statusLoading === property._id && (
                        <span className="ml-2 inline-block animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-gray-600"></span>
                      )}
                    </div>
                  </td>
                )}

                {/* ACTIONS COLUMN */}
                <td className="whitespace-nowrap px-6 py-4 text-sm">
                  <div className="flex items-center space-x-4">
                    <Link
                      href={`/host/onboarding/${property._id}`}
                      className="text-green-600 hover:text-green-900"
                      title="Edit Property"
                    >
                      <Edit className="h-5 w-5" />
                    </Link>

                    <button
                      className="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Delete Property"
                      onClick={() => handleDelete(property._id)}
                      disabled={deleteLoading === property._id}
                    >
                      {deleteLoading === property._id ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-red-600"></div>
                      ) : (
                        <Trash2 className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );

  return (
    <>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">Property Management</h1>
        <div className="mt-4 sm:mt-0 flex gap-2">
          <Link
            href="/host/onboarding/new"
            className="inline-flex items-center gap-2 rounded-md bg-[#1035ac] px-4 py-2 text-sm font-medium text-white hover:bg-blue-800"
            onClick={handleCreateNew}
          >
            <Plus className="h-4 w-4" />
            Create New Property
          </Link>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
        {/* Tabs */}
        <div className="flex space-x-2 flex-wrap">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              className={`rounded-md px-3 py-1.5 text-sm mb-2 ${
                activeTab === tab.key
                  ? "bg-[#1035ac] text-white"
                  : "bg-gray-100 hover:bg-gray-200"
              }`}
              onClick={() => {
                setActiveTab(tab.key);
                setSearchQuery(""); // Clear search when switching tabs
              }}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* 3. Search Input UI */}
        <div className="relative w-full sm:w-64">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full rounded-md border border-gray-300 bg-white py-2 pl-10 pr-3 text-sm placeholder-gray-500 focus:border-[#1035ac] focus:outline-none focus:ring-1 focus:ring-[#1035ac]"
            placeholder="Search properties..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-lg border bg-white p-4 shadow-sm lg:p-6">
        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#1035ac]"></div>
          </div>
        ) : error ? (
          <p className="text-red-500">Error: {error}</p>
        ) : getFilteredProperties().length > 0 ? (
          // 4. Use the filtered properties here
          renderPropertyTable(getFilteredProperties())
        ) : (
          <div className="text-center text-gray-500 py-8">
            <p>{getEmptyMessage()}</p>
            {activeTab === "draft" && !searchQuery && (
              <Link
                href="/host/onboarding/new"
                className="inline-flex items-center gap-2 mt-4 rounded-md bg-[#1035ac] px-4 py-2 text-sm font-medium text-white hover:bg-blue-800"
              >
                <Plus className="h-4 w-4" />
                Create Your First Property
              </Link>
            )}
          </div>
        )}
      </div>

      {showReviewPopup && (
        <div className="fixed inset-0 backdrop-blur-sm bg-[#00000049] bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-auto">
            <h3 className="text-lg font-semibold mb-4">
              {reviewAction === "approve"
                ? "Approve Property"
                : "Reject Property"}
            </h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to {reviewAction} the property "
              {selectedProperty?.placeName}"?
            </p>

            {/* Show textarea ONLY if the action is reject */}
            {reviewAction === "reject" && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for rejection (Required)
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Please explain what the host needs to fix..."
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 min-h-[100px]"
                  required
                />
              </div>
            )}

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={handleReviewCancel}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                disabled={reviewLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleReviewConfirm}
                className={`px-4 py-2 text-white rounded-md disabled:opacity-50 ${
                  reviewAction === "approve"
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-red-600 hover:bg-red-700"
                }`}
                disabled={
                  reviewLoading ||
                  (reviewAction === "reject" && !rejectionReason.trim())
                }
              >
                {reviewLoading
                  ? "Processing..."
                  : reviewAction === "approve"
                    ? "Approve"
                    : "Reject"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
