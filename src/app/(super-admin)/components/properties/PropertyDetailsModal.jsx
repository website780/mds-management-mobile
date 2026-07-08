"use client";

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { 
  X, MapPin, Phone, Mail, User, CheckCircle, 
  FileText, Check, X as XIcon, Landmark, 
  Scale, CreditCard, Users, Download, FileEdit
} from "lucide-react";
import { fetchUserById, clearSelectedUser } from "@/redux/features/admin/adminSlice"; 
import { reviewProperty, getAllProperties, getFinanceLegal, changePropertyStatus } from "@/redux/features/property/propertySlice";
import toast from "react-hot-toast";

const PropertyDetailsModal = ({ property, isOpen, onClose }) => {
  const dispatch = useDispatch();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [showReviewPopup, setShowReviewPopup] = useState(false);
  const [reviewAction, setReviewAction] = useState("");
  const [rejectionReason, setRejectionReason] = useState(""); 

  const { selectedUser, isUserLoading } = useSelector((state) => ({
    selectedUser: state.admin.selectedUser,
    isUserLoading: state.admin.isLoading,
  }));

  const { currentFinanceLegal } = useSelector((state) => ({
    currentFinanceLegal: state.property.currentFinanceLegal,
  }));

  const { user: authUser } = useSelector((state) => ({
    user: state.auth.user,
  }));

  const isAdmin = authUser?.role === "admin";

  useEffect(() => {
    if (isOpen && property?.owner) {
      dispatch(fetchUserById(property.owner));
      dispatch(getFinanceLegal(property._id));
    }
    return () => {
      dispatch(clearSelectedUser());
    };
  }, [isOpen, property?.owner, property?._id, dispatch]);

  if (!isOpen || !property) return null;

  const getStatusIndex = () => {
    switch (property.status?.toLowerCase()) {
      case "draft": return 0;
      case "pending": return 1;
      case 'published': return 3;
      default: return 2;
    }
  };

  const statusIndex = getStatusIndex();
  const verificationSteps = [
    { label: "Draft" },
    { label: "Approved" },
    { label: 'published' }
  ];

  const availableAmenities = property.amenities?.basicFacilities 
    ? Object.keys(property.amenities.basicFacilities).filter(
        (key) => property.amenities.basicFacilities[key].available
      )
    : [];

  const handleReviewConfirm = async () => {
    if (!property || !reviewAction) return;

    if (reviewAction === "reject" && !rejectionReason.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }

    try {
      setReviewLoading(true);
      
      let newStatus = "pending";
      if (reviewAction === "approve") newStatus = 'published';
      if (reviewAction === "reject") newStatus = 'rejected';
      if (reviewAction === "draft") newStatus = 'draft';

      await dispatch(
        changePropertyStatus({ 
          id: property._id, 
          status: newStatus,
          rejectionReason: reviewAction === "reject" ? rejectionReason : undefined
        })
      ).unwrap();
      
      dispatch(getAllProperties());
      toast.success(`Property status updated to ${newStatus} successfully!`);
      onClose();
    } catch (error) {
      toast.error(`Error: ${error.message || "Action failed"}`);
    } finally {
      setReviewLoading(false);
      setShowReviewPopup(false);
      setRejectionReason(""); 
      setReviewAction(""); 
    }
  };

  const handleCancelReview = () => {
    setShowReviewPopup(false);
    setRejectionReason("");
    setReviewAction("");
  };

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-y-auto backdrop-blur-sm bg-[#0000004f] bg-opacity-60 flex items-center justify-center p-0 sm:p-4">
        <div className="bg-white sm:rounded-2xl max-w-6xl w-full min-h-screen sm:min-h-0 sm:max-h-[92vh] overflow-hidden flex flex-col shadow-2xl">
          
          {/* Header */}
          <div className="flex items-center justify-between p-4 md:p-6 border-b bg-white">
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-gray-900">{property.placeName}</h2>
              <div className="flex flex-wrap items-center gap-2 text-xs md:text-sm text-gray-500 mt-1">
                <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-medium">{property.propertyType}</span>
                <span className="hidden sm:inline">•</span>
                <span>Built: {property.propertyBuilt}</span>
                <span className="hidden sm:inline">•</span>
                <span className="font-mono">ID: {property._id}</span>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-all">
              <X className="w-6 h-6 text-gray-500" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
              
              <div className="lg:col-span-2 space-y-6 md:space-y-8">
                {/* 1. Workflow Progress */}
                <div className="bg-white p-4 md:p-6 rounded-xl border border-gray-200 overflow-x-auto">
                  <h3 className="text-xs md:text-sm font-bold uppercase tracking-wider text-gray-400 mb-4 md:mb-6">Verification Workflow</h3>
                  <div className="flex items-center justify-between min-w-[300px]">
                    {verificationSteps.map((step, index) => (
                      <div key={index} className="flex flex-1 items-center last:flex-none">
                        <div className="flex flex-col items-center gap-2">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                            index <= statusIndex ? "bg-green-600 text-white" : "bg-gray-200 text-gray-500"
                          }`}>
                            {index < statusIndex ? <Check className="w-4 h-4" /> : index + 1}
                          </div>
                          <span className={`text-xs font-medium ${index <= statusIndex ? "text-green-700" : "text-gray-400"}`}>{step.label}</span>
                        </div>
                        {index < verificationSteps.length - 1 && (
                          <div className={`flex-1 h-0.5 mx-2 md:mx-4 ${index < statusIndex ? "bg-green-600" : "bg-gray-200"}`}></div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                 {/* 2. Media Gallery */}
                <div className="bg-white p-4 md:p-6 rounded-xl border border-gray-200">
                  <h3 className="text-base md:text-lg font-bold text-gray-900 mb-4">Media & Gallery</h3>
                  <div className="flex flex-col sm:grid sm:grid-cols-5 gap-3 h-auto sm:h-64">
                    <div className="sm:col-span-3 h-48 sm:h-full rounded-lg overflow-hidden border">
                      <img 
                        src={property.media?.images?.[activeImageIndex]?.url} 
                        alt="Preview" 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                    <div className="sm:col-span-2 flex flex-row sm:grid sm:grid-cols-2 gap-2 overflow-x-auto sm:overflow-y-auto pb-2 sm:pb-0 pr-1 snap-x">
                      {property.media?.images?.map((img, i) => (
                        <button 
                          key={img._id} 
                          onClick={() => setActiveImageIndex(i)}
                          className={`h-20 w-24 sm:w-auto flex-shrink-0 sm:flex-shrink rounded-md overflow-hidden border-2 transition-all snap-start ${activeImageIndex === i ? "border-blue-600 scale-95" : "border-transparent opacity-70"}`}
                        >
                          <img src={img.url} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 3. Finance & Legal Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                   {/* Bank Details */}
                   <div className="bg-white p-4 md:p-6 rounded-xl border border-gray-200">
                      <div className="flex items-center gap-2 mb-4 text-blue-600 font-bold">
                        <Landmark className="w-5 h-5" />
                        <h3>Bank Details</h3>
                      </div>
                      {currentFinanceLegal?.finance?.bankDetails ? (
                        <div className="space-y-3 text-sm">
                          <div className="flex justify-between border-b pb-2"><span className="text-gray-500">Bank Name</span><span className="font-medium text-right">{currentFinanceLegal.finance.bankDetails.bankName}</span></div>
                          <div className="flex justify-between border-b pb-2"><span className="text-gray-500">Account No.</span><span className="font-mono font-medium">{currentFinanceLegal.finance.bankDetails.accountNumber}</span></div>
                          <div className="flex justify-between border-b pb-2"><span className="text-gray-500">IFSC Code</span><span className="font-mono font-medium">{currentFinanceLegal.finance.bankDetails.ifscCode}</span></div>
                        </div>
                      ) : <p className="text-xs text-gray-400 italic">No bank details provided.</p>}
                   </div>

                   {/* Tax Details */}
                   <div className="bg-white p-4 md:p-6 rounded-xl border border-gray-200">
                      <div className="flex items-center gap-2 mb-4 text-indigo-600 font-bold">
                        <FileText className="w-5 h-5" />
                        <h3>Tax & Documents</h3>
                      </div>
                      {currentFinanceLegal?.finance?.taxDetails ? (
                        <div className="space-y-3 text-sm">
                          <div className="flex justify-between border-b pb-2"><span className="text-gray-500">PAN Card</span><span className="font-mono font-medium">{currentFinanceLegal.finance.taxDetails.pan}</span></div>
                          <div className="flex justify-between border-b pb-2"><span className="text-gray-500">GSTIN</span><span className="font-medium">{currentFinanceLegal.finance.taxDetails.gstin || "N/A"}</span></div>
                          <div className="flex justify-between border-b pb-2"><span className="text-gray-500">TAN</span><span className="font-medium">{currentFinanceLegal.finance.taxDetails.tan || "N/A"}</span></div>
                        </div>
                      ) : <p className="text-xs text-gray-400 italic">No tax details provided.</p>}
                   </div>
                </div>

                {/* Legal / Ownership Document */}
                <div className="bg-white p-4 md:p-6 rounded-xl border border-gray-200">
                  <div className="flex flex-wrap items-center justify-between mb-4 gap-3">
                    <div className="flex items-center gap-2 text-orange-600 font-bold">
                      <Scale className="w-5 h-5" />
                      <h3>Legal & Ownership</h3>
                    </div>
                    {currentFinanceLegal?.legal?.ownershipDetails?.registrationDocument?.url && (
                      <a 
                        href={currentFinanceLegal.legal.ownershipDetails.registrationDocument.url} 
                        target="_blank" 
                        className="flex items-center gap-1 text-xs bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" /> View Document
                      </a>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500 text-xs mb-1">Ownership Type</p>
                      <p className="font-medium bg-gray-50 p-2 rounded">{currentFinanceLegal?.legal?.ownershipDetails?.ownershipType || "Not Specified"}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs mb-1">Registered Address</p>
                      <p className="font-medium bg-gray-50 p-2 rounded">{currentFinanceLegal?.legal?.ownershipDetails?.propertyAddress || "Not Specified"}</p>
                    </div>
                  </div>
                </div>

                {/* 4. Amenities */}
                <div className="bg-white p-4 md:p-6 rounded-xl border border-gray-200">
                  <h3 className="text-base md:text-lg font-bold text-gray-900 mb-4">Amenities & Basic Facilities</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4">
                    {availableAmenities.map((name) => (
                      <div key={name} className="flex items-center gap-2 md:gap-3 p-2 md:p-3 bg-gray-50 rounded-lg border border-gray-100">
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <span className="text-xs md:text-sm font-medium text-gray-700">{name.replace(/([A-Z])/g, ' $1').trim()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-4 md:space-y-6">
                <div className="bg-white p-4 md:p-6 rounded-xl border border-gray-200 shadow-sm">
                  <h3 className="text-xs md:text-sm font-bold uppercase tracking-wider text-gray-400 mb-3 md:mb-4">Location</h3>
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-red-500 mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-bold text-gray-900 text-sm md:text-base">{property.location?.houseName}</p>
                      <p className="text-xs md:text-sm text-gray-600 leading-relaxed">
                        {property.location?.street}, {property.location?.city},<br />
                        {property.location?.state} - {property.location?.postalCode}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-600 p-4 md:p-6 rounded-xl text-white shadow-lg">
                  <h3 className="text-[10px] md:text-xs font-bold uppercase tracking-widest opacity-70 mb-4">Registered Partner</h3>
                  {isUserLoading ? (
                    <div className="animate-pulse space-y-3">
                      <div className="w-10 md:w-12 h-10 md:h-12 bg-blue-400 rounded-full"></div>
                      <div className="h-4 bg-blue-400 rounded w-3/4"></div>
                    </div>
                  ) : selectedUser ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-blue-600 flex-shrink-0">
                          <User className="w-5 h-5" />
                        </div>
                        <div className="overflow-hidden">
                          <p className="font-bold truncate">{selectedUser.name}</p>
                          <p className="text-[10px] opacity-70 truncate">UID: {selectedUser._id}</p>
                        </div>
                      </div>
                      <div className="space-y-2 border-t border-blue-400 pt-4 text-xs md:text-sm">
                        <div className="flex items-center gap-2"><Mail className="w-4 h-4 opacity-70 flex-shrink-0" /> <span className="truncate">{selectedUser.email}</span></div>
                        <div className="flex items-center gap-2"><Phone className="w-4 h-4 opacity-70 flex-shrink-0" /> {selectedUser.phoneNumber || property.mobileNumber}</div>
                      </div>
                    </div>
                  ) : <p className="text-xs italic opacity-60">Owner info unavailable.</p>}
                </div>

                {/* Admin Actions */}
                {isAdmin && (
                  <div className="space-y-3 pb-6 sm:pb-0">
                    {property.status?.toLowerCase() === 'published' ? (
                      <>
                        <button 
                          onClick={() => { setReviewAction("pending"); setShowReviewPopup(true); }}
                          className="w-full bg-white border-2 border-orange-500 text-orange-600 hover:bg-orange-50 py-3 md:py-3.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2 text-sm md:text-base"
                        >
                          <FileEdit className="w-4 md:w-5 h-4 md:h-5" /> Unpublish & Move to Draft
                        </button>
                        <button 
                          onClick={() => { setReviewAction("reject"); setShowReviewPopup(true); }}
                          className="w-full bg-white border-2 border-red-500 text-red-500 hover:bg-red-50 py-3 md:py-3.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2 text-sm md:text-base"
                        >
                          <XIcon className="w-4 md:w-5 h-4 md:h-5" /> Reject Property
                        </button>
                      </>
                    ) : property.status?.toLowerCase() === 'rejected' ? (
                      <>
                        <button 
                          onClick={() => { setReviewAction("approve"); setShowReviewPopup(true); }}
                          className="w-full bg-green-500 hover:bg-green-600 text-white py-3 md:py-3.5 rounded-xl font-bold transition-all shadow-md flex items-center justify-center gap-2 text-sm md:text-base"
                        >
                          <Check className="w-4 md:w-5 h-4 md:h-5" /> Approve & Publish
                        </button>
                        <button 
                          onClick={() => { setReviewAction("draft"); setShowReviewPopup(true); }}
                          className="w-full bg-white border-2 border-gray-400 text-gray-600 hover:bg-gray-50 py-3 md:py-3.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2 text-sm md:text-base"
                        >
                          <FileEdit className="w-4 md:w-5 h-4 md:h-5" /> Move to Draft
                        </button>
                      </>
                    ) : (
                      <>
                        <button 
                          onClick={() => { setReviewAction("approve"); setShowReviewPopup(true); }}
                          className="w-full bg-green-500 hover:bg-green-600 text-white py-3 md:py-3.5 rounded-xl font-bold transition-all shadow-md flex items-center justify-center gap-2 text-sm md:text-base"
                        >
                          <Check className="w-4 md:w-5 h-4 md:h-5" /> Approve & Publish
                        </button>
                        <button 
                          onClick={() => { setReviewAction("reject"); setShowReviewPopup(true); }}
                          className="w-full bg-white border-2 border-red-500 text-red-500 hover:bg-red-50 py-3 md:py-3.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2 text-sm md:text-base"
                        >
                          <XIcon className="w-4 md:w-5 h-4 md:h-5" /> Reject Property
                        </button>
                        <button 
                          onClick={() => { setReviewAction("draft"); setShowReviewPopup(true); }}
                          className="w-full bg-white border-2 border-gray-400 text-gray-600 hover:bg-gray-50 py-3 md:py-3.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2 text-sm md:text-base"
                        >
                          <FileEdit className="w-4 md:w-5 h-4 md:h-5" /> Move to Draft
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Confirmation Popup */}
      {showReviewPopup && (
        <div className="fixed inset-0 bg-[#0000004f] backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-2xl p-6 md:p-8 max-w-lg w-full text-center shadow-2xl">
            <div className={`w-14 md:w-16 h-14 md:h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
              reviewAction === 'approve' ? 'bg-green-100 text-green-600' : 
              reviewAction === 'reject' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'
            }`}>
              {reviewAction === 'approve' ? <Check className="w-6 md:w-8 h-6 md:h-8" /> : 
               reviewAction === 'reject' ? <XIcon className="w-6 md:w-8 h-6 md:h-8" /> : <FileEdit className="w-6 md:w-8 h-6 md:h-8" />}
            </div>
            <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2">Confirm {reviewAction.charAt(0).toUpperCase() + reviewAction.slice(1)}</h3>
            <p className="text-xs md:text-sm text-gray-500 mb-4">
              Are you sure you want to {reviewAction} "{property.placeName}"?
              {reviewAction === 'draft' && " This will allow the host to edit the property details again."}
            </p>

            {reviewAction === 'reject' && (
              <div className="mb-6 text-left">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for rejection (Required)
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Please explain what the host needs to fix..."
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 min-h-[100px]"
                  required
                />
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <button onClick={handleCancelReview} className="flex-1 py-2.5 md:py-3 border border-gray-300 rounded-lg font-bold text-gray-600 hover:bg-gray-50 text-sm md:text-base">Cancel</button>
              <button 
                onClick={handleReviewConfirm}
                disabled={reviewLoading || (reviewAction === 'reject' && !rejectionReason.trim())}
                className={`flex-1 py-2.5 md:py-3 text-white rounded-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base ${
                  reviewAction === 'approve' ? 'bg-green-600' : 
                  reviewAction === 'reject' ? 'bg-red-600' : 'bg-gray-600'
                }`}
              >
                {reviewLoading ? "Processing..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PropertyDetailsModal;