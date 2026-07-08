"use client";
import { logoutUser } from "@/redux/features/auth/authSlice";
import {
  Popover,
  PopoverButton,
  PopoverPanel,
  Transition,
} from "@headlessui/react";
import Link, { useRouter } from "expo-router";
import { User } from "lucide-react";
import { Fragment } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  FavouriteIcon,
  Logout03Icon,
  Task01Icon,
  UserSharingIcon,
} from "../component/Icons";

export default function AvatarDropdown() {
  const { isAuthenticated, isLoading, user, token } = useSelector(
    (state) => state.auth,
  );
  console.log(user);

  const dispatch = useDispatch();
  const router = useRouter();

  // useEffect(() => {
  //   if (!token) {
  //     dispatch(fetchCurrentUser());
  //   }
  // }, []);

  const handleLogout = async () => {
    try {
      // Clear cookies manually
      document.cookie =
        "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
      document.cookie =
        "authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
      document.cookie =
        "jwt=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";

      // Dispatch logout action
      await dispatch(logoutUser());

      // Small delay to ensure cookies are cleared
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Force hard navigation to login page
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout error:", error);
      // Fallback: still redirect even if there's an error
      window.location.href = "/login";
    }
  };

  // If not authenticated, show login button
  if (!isAuthenticated && isLoading) {
    return (
      <Link href="/login" className={`flex`}>
        <div className="flex -space-x-2 overflow-hidden">
          <img
            className="inline-block size-10 rounded-full ring-2 ring-white"
            src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
            alt=""
          />
        </div>
        <div className="flex h-10 w-10 items-center justify-center self-center rounded-full text-slate-700 hover:bg-slate-100 focus:outline-none   sm:h-12 sm:w-12">
          {/* <Avatar sizeClass="w-8 h-8 sm:w-9 sm:h-9" /> */}
        </div>
      </Link>
    );
  }

  return (
    <>
      <Popover className={`AvatarDropdown relative flex`}>
        {({ open, close }) => (
          <>
            <PopoverButton className="flex items-center justify-center self-center focus:outline-none">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-[#1035ac] flex items-center justify-center ring-2 ring-white">
                {user?.profilePhoto ? (
                  <img
                    src={user.profilePhoto}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-5 h-5 text-white" strokeWidth={1.5} />
                )}
              </div>
            </PopoverButton>
            <Transition
              as={Fragment}
              enter="transition ease-out duration-200"
              enterFrom="opacity-0 translate-y-1"
              enterTo="opacity-100 translate-y-0"
              leave="transition ease-in duration-150"
              leaveFrom="opacity-100 translate-y-0"
              leaveTo="opacity-0 translate-y-1"
            >
              <PopoverPanel className="absolute -end-5 top-13 z-10 w-screen max-w-[260px] px-4 sm:end-0 sm:px-0">
                <div className="overflow-hidden rounded-3xl shadow-lg ring-1 ring-black ring-opacity-5">
                  <div className="relative grid grid-cols-1 gap-6 bg-white px-6  py-7">
                    <div className="flex items-center gap-x-3">
                      {/* <Avatar sizeClass="w-12 h-12" /> */}
                      <div className="flex-shrink-0 w-12 h-12 rounded-full overflow-hidden">
                        {user?.profilePhoto ? (
                          <img
                            src={user.profilePhoto}
                            alt="Profile"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-[#1035ac]">
                            <User
                              className="w-5 h-5 text-white"
                              strokeWidth={1.5}
                            />
                          </div>
                        )}
                      </div>

                      <div className="flex-grow">
                        <h4 className="font-semibold">
                          {user?.name || "User"}
                        </h4>
                        <p className="mt-0.5 text-xs">{user?.email || ""}</p>
                      </div>
                    </div>

                    <div className="w-full border-b border-neutral-200 " />

                    {/* ------------------ 1 --------------------- */}
                    <Link
                      href={"/account"}
                      className="-m-3 flex items-center rounded-lg p-2 hover:bg-neutral-100 focus:outline-none focus-visible:ring focus-visible:ring-orange-500 focus-visible:ring-opacity-50 "
                      onClick={() => close()}
                    >
                      <div className="flex flex-shrink-0 items-center justify-center text-neutral-500 ">
                        <UserSharingIcon />
                      </div>
                      <div className="ms-4">
                        <p className="text-sm font-medium">{"My Account"}</p>
                      </div>
                    </Link>

                    {/* ------------------ 2 --------------------- */}
                    <Link
                      href={"/my-bookings"}
                      className="-m-3 flex items-center rounded-lg p-2 hover:bg-neutral-100 focus:outline-none focus-visible:ring focus-visible:ring-orange-500 focus-visible:ring-opacity-50 "
                      onClick={() => close()}
                    >
                      <div className="flex flex-shrink-0 items-center justify-center text-neutral-500 ">
                        <Task01Icon />
                      </div>
                      <div className="ms-4">
                        <p className="text-sm font-medium">{"My bookings"}</p>
                      </div>
                    </Link>

                    {/* ------------------ 2 --------------------- */}
                    <Link
                      href={"/account-savelists"}
                      className="-m-3 flex items-center rounded-lg p-2 hover:bg-neutral-100 focus:outline-none focus-visible:ring focus-visible:ring-orange-500 focus-visible:ring-opacity-50 "
                      onClick={() => close()}
                    >
                      <div className="flex flex-shrink-0 items-center justify-center text-neutral-500 ">
                        <FavouriteIcon />
                      </div>
                      <div className="ms-4">
                        <p className="text-sm font-medium">{"Wishlist"}</p>
                      </div>
                    </Link>

                    <div className="w-full border-b border-neutral-200 " />

                    {/* ------------------ 2 --------------------- */}
                    {/* <Link
                      href={"/mydivestays-support"}
                      className="-m-3 flex items-center rounded-lg p-2 hover:bg-neutral-100 focus:outline-none focus-visible:ring focus-visible:ring-orange-500 focus-visible:ring-opacity-50 "
                      onClick={() => close()}
                    >
                      <div className="flex flex-shrink-0 items-center justify-center text-neutral-500 ">
                        <HelpSquareIcon />
                      </div>
                      <div className="ms-4">
                        <p className="text-sm font-medium">{"Help"}</p>
                      </div>
                    </Link> */}

                    {/* ------------------ 2 --------------------- */}
                    <button
                      className="-m-3 flex items-center rounded-lg p-2 hover:bg-neutral-100 focus:outline-none focus-visible:ring focus-visible:ring-orange-500 focus-visible:ring-opacity-50 "
                      onClick={() => {
                        close();
                        handleLogout();
                      }}
                    >
                      <div className="flex flex-shrink-0 items-center justify-center text-neutral-500 ">
                        <Logout03Icon />
                      </div>
                      <div className="ms-4">
                        <p className="text-sm font-medium">{"Logout"}</p>
                      </div>
                    </button>
                  </div>
                </div>
              </PopoverPanel>
            </Transition>
          </>
        )}
      </Popover>
    </>
  );
}
