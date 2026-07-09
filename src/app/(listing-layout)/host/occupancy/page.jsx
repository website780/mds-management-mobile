"use client";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import RoomOccupancy from "@/components/RoomOccupancy/RoomOccupancy";

import { getAllProperties, getDraftProperties } from "@/redux/features/property/propertySlice";
import PropertySelector from "@/app/(super-admin)/components/bookings/PropertySelector";

const Page = () => {
  const dispatch = useDispatch();

  const { properties, draftProperties, isLoading: propertiesLoading, user } = useSelector(
    (state) => ({
      properties: state.property.properties,
      draftProperties: state.property.draftProperties,
      isLoading: state.property.isLoading,
      user: state.auth.user,
    })
  );

  const isAdmin = user?.role === "admin";
  const [selectedProperty, setSelectedProperty] = useState(null);

  // Fetch properties on mount
  useEffect(() => {
    dispatch(getAllProperties());
    if (isAdmin) dispatch(getDraftProperties());
  }, [dispatch, isAdmin]);

  // Restore persisted selection from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("selectedProperty");
    if (saved) {
      try {
        setSelectedProperty(JSON.parse(saved));
      } catch {
        localStorage.removeItem("selectedProperty");
      }
    }
  }, []);

  const handlePropertyChange = (property) => {
    setSelectedProperty(property);
    if (property) {
      localStorage.setItem("selectedProperty", JSON.stringify(property));
    } else {
      localStorage.removeItem("selectedProperty");
    }
  };

  return (
    <>
      <PropertySelector
        properties={properties ?? []}
        selectedProperty={selectedProperty}
        onPropertyChange={handlePropertyChange}
        isAdmin={isAdmin}
      />
      <RoomOccupancy property={selectedProperty} />
    </>
  );
};

export default Page;