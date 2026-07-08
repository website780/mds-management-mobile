"use client";
import Image from "expo-image";
import Link, { useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";

export default function PropertyTypeSelection() {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState("");

  const propertyTypes = [
    {
      id: "Dharamshala",
      title: "Dharamshala",
      description:
        "A charitable rest-house or lodging primarily for pilgrims, offering simple and affordable accommodation.",
      image: "/images/property_types/dharamshala.png",
      value: "Dharamshala",
    },
    {
      id: "Ashram",
      title: "Ashram",
      description:
        "A spiritual center offering meditation/yoga stay with a guru or community.",
      image: "/images/property_types/ashram.png",
      value:
        "Ashram(Spiritual centers offering meditation/yoga stay with a guru or community)",
    },
    {
      id: "TrustGuestHouse",
      title: "Trust Guest House",
      description:
        "A guest house run by a trust or charitable organization, providing comfortable and affordable lodging for pilgrims.",
      image: "/images/property_types/trust_guest_house.png",
      value:
        "Trust Guest House( Guesthouses owned/operated by temple or religious trusts)",
    },
    {
      id: "YatriNiwas",
      title: "Yatri Niwas",
      description:
        "A dedicated lodging facility for pilgrims and travelers, offering clean and affordable stays near religious or tourist spots.",
      image: "/images/property_types/yatri_niwas.png",
      value:
        "Yatri Niwas / Pilgrim Lodge(Budget stays designed for pilgrims by governments or religious orgs)",
    },
  ];

  const handleContinue = () => {
    if (selectedType) {
      sessionStorage.setItem("selectedPropertyType", selectedType);
      sessionStorage.setItem("skipDrafts", "true");
      router.push("/host/onboarding/new");
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <Link
          href="/host/properties"
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Properties
        </Link>
      </div>

      <div className="mb-10">
        <h1
          className="text-3xl font-bold text-[#0f213a] mb-2"
          style={{ fontFamily: "Georgia, serif" }}
        >
          Which property type would you like to list?
        </h1>
        <p className="text-gray-500 text-lg">
          Please select your property type from below options
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {propertyTypes.map((type) => (
          <div
            key={type.id}
            onClick={() => setSelectedType(type.value)}
            className={`border rounded-xl overflow-hidden cursor-pointer transition-all duration-200 flex flex-col bg-white ${
              selectedType === type.value
                ? "border-[#1035ac] shadow-md ring-1 ring-[#1035ac]"
                : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
            }`}
          >
            <div className="p-4 flex items-center justify-between border-b border-gray-100">
              <h3 className="font-bold text-[#0f213a] text-lg">{type.title}</h3>
              <div
                className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                  selectedType === type.value
                    ? "border-[#1035ac]"
                    : "border-gray-300"
                }`}
              >
                {selectedType === type.value && (
                  <div className="w-3 h-3 rounded-full bg-[#1035ac]"></div>
                )}
              </div>
            </div>
            <div className="h-40 w-full relative">
              <Image
                src={type.image}
                alt={type.title}
                fill
                className="object-cover"
              />
            </div>
            <div className="p-4 flex-1">
              <p className="text-sm text-gray-500 leading-relaxed line-clamp-4">
                {type.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end pt-6 border-t border-gray-200">
        <button
          onClick={handleContinue}
          disabled={!selectedType}
          className={`px-8 py-3 rounded-full font-medium transition-colors ${
            selectedType
              ? "bg-[#1035ac] text-white hover:bg-[#0c2780]"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
          }`}
        >
          Continue
        </button>
      </div>
    </div>
  );
}
