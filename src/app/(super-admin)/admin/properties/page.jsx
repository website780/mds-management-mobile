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
import {
    AlertTriangle,
    CheckCircle,
    Eye,
    Home,
    MoreHorizontal,
    Plus,
    Search,
    Trophy,
} from "lucide-react-native";
import { useEffect, useState } from "react";
import {toast} from "@backpackapp-io/react-native-toast";
import { useDispatch, useSelector } from "react-redux";
import PropertyDetailsModal from "../../components/properties/PropertyDetailsModal";

export default function Listing() {
  const dispatch = useDispatch();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("all");
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [reviewLoading, setReviewLoading] = useState(null);
  const [showReviewPopup, setShowReviewPopup] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [reviewAction, setReviewAction] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [showPropertyDetails, setShowPropertyDetails] = useState(false);
  const [selectedPropertyForDetails, setSelectedPropertyForDetails] =
    useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [toggleLoading, setToggleLoading] = useState(null);

  const handleToggleActive = async (property) => {
    try {
      setToggleLoading(property._id);
      const newStatus = !property.isActive;

      const response = await dispatch(
        togglePropertyActive({ id: property._id, isActive: newStatus }),
      ).unwrap();

      if (response.message) {
        toast.success(response.message, { duration: 5000 });
      } else {
        toast.success(`Property is now ${newStatus ? "active" : "inactive"}`);
      }

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

  const [statusFilter, setStatusFilter] = useState("All Status");
  const [locationFilter, setLocationFilter] = useState("All Locations");

  const { properties, draftProperties, isLoading, error, user } = useSelector(
    (state) => ({
      properties: state.property.properties,
      draftProperties: state.property.draftProperties,
      isLoading: state.property.isLoading,
      error: state.property.error,
      user: state.auth.user,
    }),
  );

  const isAdmin = user?.role === "admin";

  useEffect(() => {
    dispatch(getAllProperties());
    dispatch(getDraftProperties());
  }, [dispatch]);

  const totalProperties = properties?.length || 0;
  const pendingProperties =
    properties?.filter((p) => p.status === "pending").length || 0;
  const liveProperties =
    properties?.filter((p) => p.status === "published").length || 0;
  const docExpiryAlerts = 23;

  const getFilteredProperties = () => {
    let filtered = properties || [];

    if (searchTerm) {
      filtered = filtered.filter(
        (property) =>
          property.placeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          property.location?.city
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()),
      );
    }

    if (statusFilter !== "All Status") {
      filtered = filtered.filter(
        (property) => property.status === statusFilter.toLowerCase(),
      );
    }

    return filtered;
  };

  const handleViewDetails = (property) => {
    setSelectedPropertyForDetails(property);
    setShowPropertyDetails(true);
  };

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
        const result = await dispatch(deleteProperty(id)).unwrap();
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

  const handleReviewConfirm = async () => {
    if (!selectedProperty || !reviewAction) return;

    if (reviewAction === "reject" && !rejectionReason.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }

    try {
      setReviewLoading(selectedProperty._id);
      const newStatus = reviewAction === "approve" ? "published" : "rejected";

      await dispatch(
        changePropertyStatus({
          id: selectedProperty._id,
          status: newStatus,
          rejectionReason:
            reviewAction === "reject" ? rejectionReason : undefined,
        }),
      ).unwrap();

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
      setRejectionReason("");
    }
  };

  const handleReviewCancel = () => {
    setShowReviewPopup(false);
    setSelectedProperty(null);
    setReviewAction("");
    setRejectionReason("");
  };

  return (
    <>
      <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Property Management
          </h1>
          <p className="text-sm md:text-base text-gray-600">
            Manage all Dharamshala listings, verification workflows, and partner
            relationships.
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
          <div className="bg-white rounded-lg p-5 md:p-6 shadow-sm border border-gray-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl md:text-3xl font-bold text-gray-900">
                  {totalProperties.toLocaleString()}
                </p>
                <p className="text-gray-600 text-sm">Total Properties</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <Home className="h-6 w-6 md:h-8 md:w-8 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-5 md:p-6 shadow-sm border border-gray-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl md:text-3xl font-bold text-gray-900">
                  {pendingProperties}
                </p>
                <p className="text-gray-600 text-sm">Pending Approval</p>
              </div>
              <div className="p-3 bg-yellow-50 rounded-lg">
                <Trophy className="h-6 w-6 md:h-8 md:w-8 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-5 md:p-6 shadow-sm border border-gray-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl md:text-3xl font-bold text-gray-900">
                  {liveProperties}
                </p>
                <p className="text-gray-600 text-sm">Live Properties</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <CheckCircle className="h-6 w-6 md:h-8 md:w-8 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-5 md:p-6 shadow-sm border border-gray-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl md:text-3xl font-bold text-gray-900">
                  {docExpiryAlerts}
                </p>
                <p className="text-gray-600 text-sm">Doc Expiry Alerts</p>
              </div>
              <div className="p-3 bg-red-50 rounded-lg">
                <AlertTriangle className="h-6 w-6 md:h-8 md:w-8 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Controls */}
        <div className="bg-white rounded-lg p-4 md:p-6 shadow-sm border border-gray-300 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 w-full lg:flex-1">
              {/* Search */}
              <div className="relative w-full sm:w-auto flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search properties..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Status Filter */}
              <select
                className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option>All Status</option>
                <option>Published</option>
                <option>Pending</option>
                <option>Draft</option>
                <option>Rejected</option>
              </select>

              {/* Location Filter */}
              <select
                className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
              >
                <option>All Locations</option>
                <option>Mumbai</option>
                <option>Delhi</option>
                <option>Chennai</option>
              </select>
            </div>
          </div>
        </div>

        {/* Properties List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-300">
          <div className="p-4 md:p-6">
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <h2 className="text-lg md:text-xl font-semibold text-gray-900">
                Properties List
              </h2>
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
              </div>
            ) : error ? (
              <p className="text-red-500">Error: {error}</p>
            ) : getFilteredProperties().length > 0 ? (
              <>
                {/* Mobile View: Cards (Visible only on screens smaller than 'md') */}
                <div className="grid grid-cols-1 gap-4 md:hidden">
                  {getFilteredProperties().map((property) => (
                    <div
                      key={property._id}
                      className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm relative"
                    >
                      <div className="flex items-start gap-4 mb-4 pr-6">
                        <div className="flex-shrink-0 h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                          <Home className="h-6 w-6 text-orange-600" />
                        </div>
                        <div>
                          <h3 className="text-base font-semibold text-gray-900">
                            {property.placeName}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {property.propertyType}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2 mb-4 text-sm">
                        <div className="flex justify-between border-b border-gray-100 pb-2">
                          <span className="text-gray-500">Partner:</span>
                          <span className="font-medium text-gray-900">
                            {property.owner || "Unassigned"}
                          </span>
                        </div>
                        <div className="flex justify-between border-b border-gray-100 pb-2">
                          <span className="text-gray-500">Pricing:</span>
                          <span className="font-medium text-gray-900">
                            ₹
                            {property.rooms?.[0]?.pricing?.baseAdultsCharge ||
                              "N/A"}
                            /night
                          </span>
                        </div>
                        <div className="flex justify-between pb-1">
                          <span className="text-gray-500">Manager:</span>
                          <span className="font-medium text-gray-900">
                            {property.manager || "Unassigned"}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-4 pt-3 border-t border-gray-100">
                        {property.status === "published" && (
                          <div className="flex items-center gap-2 mr-auto">
                            <span className="text-[10px] text-gray-500 font-medium">
                              {property.isActive ? "Active" : "Inactive"}
                            </span>
                            <button
                              onClick={() => handleToggleActive(property)}
                              disabled={toggleLoading === property._id}
                              className={`relative inline-flex h-4 w-7 items-center rounded-full transition-colors ${
                                property.isActive
                                  ? "bg-[#1035ac]"
                                  : "bg-gray-300"
                              } ${toggleLoading === property._id ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                            >
                              <span
                                className={`inline-block h-2 w-2 transform rounded-full bg-white transition-transform ${
                                  property.isActive
                                    ? "translate-x-4"
                                    : "translate-x-1"
                                }`}
                              />
                            </button>
                          </div>
                        )}
                        <button
                          onClick={() => handleViewDetails(property)}
                          className="flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium text-sm"
                        >
                          <Eye className="h-4 w-4" /> View Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop View: Table (Visible only on 'md' screens and larger) */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 uppercase tracking-wider">
                          Property
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 uppercase tracking-wider">
                          Partner
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 uppercase tracking-wider">
                          Pricing
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 uppercase tracking-wider">
                          Manager
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {getFilteredProperties().map((property) => (
                        <tr key={property._id} className="hover:bg-gray-50">
                          <td className="py-4 px-4">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                                <Home className="h-6 w-6 text-orange-600" />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {property.placeName}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {property.propertyType}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-sm text-gray-900">
                            {property.owner || "Unassigned"}
                          </td>
                          <td className="py-4 px-4 text-sm text-gray-900">
                            ₹
                            {property.rooms?.[0]?.pricing?.baseAdultsCharge ||
                              "N/A"}
                            /night
                          </td>
                          <td className="py-4 px-4 text-sm text-gray-900">
                            {property.manager || "Unassigned"}
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center space-x-3">
                              {property.status === "published" && (
                                <div className="flex items-center gap-2 mr-2">
                                  <span className="text-[10px] text-gray-500 font-medium">
                                    {property.isActive ? "Active" : "Inactive"}
                                  </span>
                                  <button
                                    onClick={() => handleToggleActive(property)}
                                    disabled={toggleLoading === property._id}
                                    className={`relative inline-flex h-4 w-7 items-center rounded-full transition-colors ${
                                      property.isActive
                                        ? "bg-[#1035ac]"
                                        : "bg-gray-300"
                                    } ${toggleLoading === property._id ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                                  >
                                    <span
                                      className={`inline-block h-2 w-2 transform rounded-full bg-white transition-transform ${
                                        property.isActive
                                          ? "translate-x-4"
                                          : "translate-x-1"
                                      }`}
                                    />
                                  </button>
                                </div>
                              )}
                              <button
                                onClick={() => handleViewDetails(property)}
                                className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center gap-1"
                              >
                                View
                              </button>
                              <button className="text-gray-400 hover:text-gray-600">
                                <MoreHorizontal className="h-5 w-5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <div className="text-center text-gray-500 py-8">
                <Home className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-lg">No properties found</p>
                <p className="text-sm">Try adjusting your search or filters</p>
                <Link
                  href="/host/onboarding/new"
                  className="inline-flex items-center gap-2 mt-4 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                  onClick={handleCreateNew}
                >
                  <Plus className="h-4 w-4" />
                  Create Your First Property
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Review Confirmation Popup */}
      {showReviewPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">
              {reviewAction === "approve"
                ? "Approve Property"
                : "Reject Property"}
            </h3>
            <p className="text-gray-600 mb-4 text-sm md:text-base">
              Are you sure you want to {reviewAction} the property "
              {selectedProperty?.placeName}"?
              {reviewAction === "reject" &&
                " This will move it to rejected status."}
            </p>

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

            <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6">
              <button
                onClick={handleReviewCancel}
                className="w-full sm:w-auto px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                disabled={reviewLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleReviewConfirm}
                className={`w-full sm:w-auto px-4 py-2 text-white rounded-md disabled:opacity-50 ${
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

      <PropertyDetailsModal
        property={selectedPropertyForDetails}
        isOpen={showPropertyDetails}
        onClose={() => {
          setShowPropertyDetails(false);
          setSelectedPropertyForDetails(null);
        }}
      />
    </>
  );
}
