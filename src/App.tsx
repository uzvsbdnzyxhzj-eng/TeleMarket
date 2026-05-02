import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CountryData } from "./types";
import { t, Language } from "./i18n";
import {
  ShoppingCart,
  Store,
  PlusCircle,
  LayoutDashboard,
  Settings,
  Menu,
  X,
  Wallet,
  AlertTriangle,
  ArrowRight,
  CheckCircle,
  Smartphone,
  Globe,
  LogOut,
  FileText,
  Bot,
  User,
  Clock,
  Timer,
  UserPlus,
  ShieldCheck,
  Headphones,
  Bitcoin,
  Coins,
  Mail,
  Users,
  Calendar,
  Heart,
} from "lucide-react";
import { auth, db } from "./firebase";

function getTimeElapsedString(timestamp: number) {
  const diffMs = Math.max(0, Date.now() - timestamp);
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 60) return `${diffMins} min run`; // wait
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} hr ${diffMins % 60}m run`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} days run`;
}
import {
  onAuthStateChanged,
  User as FirebaseUser,
  signOut,
  sendEmailVerification,
} from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  runTransaction,
  collection,
  query,
  where,
  orderBy,
  getDocs,
  onSnapshot,
  updateDoc,
  increment,
  deleteDoc,
} from "firebase/firestore";
import Login from "./Login";
import Landing from "./Landing";
import TopTicker from "./TopTicker";
import AdvertisementBanner from "./AdvertisementBanner";

type View =
  | "buy"
  | "sell"
  | "dashboard"
  | "admin"
  | "records"
  | "profile"
  | "wallet-history";

import {
  getFlag,
  requestNotificationPermission,
  sendNotification,
} from "./utils";

export const TelemarketLogo = ({ className = "h-10" }: { className?: string }) => (
  <svg
    viewBox="0 0 200 80"
    className={className}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* T Icon */}
    <g transform="translate(100, 30)">
      {/* Darker green shadow overlay for T */}
      <path d="M-15 -15 H15 V-5 H5 V15 H-5 V-5 H-15 Z" fill="#84D12F" />
      <path d="M-5 -5 H5 V15 H-5 Z" fill="#75bb29" />

      {/* Left Top Arc */}
      <path
        d="M-15 -13 C-35 -15 -45 5 -20 18 C-35 8 -30 -10 -20 -13 Z"
        fill="#84D12F"
      />

      {/* Right Bottom Arc */}
      <path
        d="M-20 18 C10 32 40 18 30 -5 C35 15 20 28 -20 18 Z"
        fill="#4B9A50"
      />
    </g>

    {/* Text */}
    <text
      x="100"
      y="65"
      textAnchor="middle"
      fill="currentColor"
      fontSize="18"
      fontWeight="900"
      fontFamily="sans-serif"
      letterSpacing="1"
    >
      TELEMARKET
    </text>
    <text
      x="100"
      y="78"
      textAnchor="middle"
      fill="currentColor"
      opacity="0.8"
      fontSize="8"
      fontWeight="700"
      fontFamily="sans-serif"
      letterSpacing="4"
    >
      SHOP SMART
    </text>
  </svg>
);

const TOPIC_OPTIONS = [
  "General",
  "Finance",
  "Gambling/Betting",
  "Crypto",
  "Gaming",
  "Technology",
  "Entertainment",
  "News",
  "Education",
  "Sports",
  "Music",
  "Movies",
];

export default function App() {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [showWelcome, setShowWelcome] = useState(true);

  const [currentView, setCurrentView] = useState<View>("dashboard");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [countries, setCountries] = useState<CountryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [markupPercent, setMarkupPercent] = useState(20);

  // User Dashboard State
  const [balanceUSD, setBalanceUSD] = useState(0);
  const [numericId, setNumericId] = useState<number | null>(null);
  const [mockCheckout, setMockCheckout] = useState<{
    method: string;
    amount: string;
  } | null>(null);
  const [topupModal, setTopupModal] = useState(false);
  const [p2pModal, setP2pModal] = useState<any>(null);
  const [topupStep, setTopupStep] = useState<1 | 2>(1);
  const [topupMethod, setTopupMethod] = useState<
    "bkash" | "nagad" | "binance" | "crypto" | null
  >(null);
  const [topupInputBdt, setTopupInputBdt] = useState<number | "">("");
  const [topupInputUsd, setTopupInputUsd] = useState<number | "">("");
  const [topupAmount, setTopupAmount] = useState<number | "">("");

  const [withdrawModal, setWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState<number | "">("");
  const [withdrawMethod, setWithdrawMethod] = useState<
    "Binance" | "BSC-USDT" | "bKash" | "Nagad"
  >("Binance");
  const [withdrawDetails, setWithdrawDetails] = useState("");

  const [purchasedNumber, setPurchasedNumber] = useState<{
    number: string;
    code?: string;
    pass?: string;
    txId?: string;
  } | null>(null);



  const [transactions, setTransactions] = useState<any[]>([]);
  const [adminWithdrawals, setAdminWithdrawals] = useState<any[]>([]);
  const [adminAddBalanceUid, setAdminAddBalanceUid] = useState("");
  const [adminAddBalanceAmount, setAdminAddBalanceAmount] = useState<
    number | ""
  >("");
  const [bannerData, setBannerData] = useState({ imageUrl: "", linkUrl: "", isActive: false });
  const [adminBannerSettings, setAdminBannerSettings] = useState({ imageUrl: "", linkUrl: "", isActive: false });
  const [isPublishingBanner, setIsPublishingBanner] = useState(false);
  const [activeUsersStats, setActiveUsersStats] = useState({
    live: 0,
    daily: 0,
    weekly: 0,
    monthly: 0,
  });
  const [referredUsers, setReferredUsers] = useState<any[]>([]);

  // local error states
  const [buyErrorId, setBuyErrorId] = useState<string | null>(null);
  const [topupError, setTopupError] = useState("");
  const [withdrawError, setWithdrawError] = useState("");

  // Load global banner data
  useEffect(() => {
    const unsub = onSnapshot(doc(db, "settings", "banner"), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setBannerData({
          imageUrl: data.imageUrl || "",
          linkUrl: data.linkUrl || "",
          isActive: data.isActive || false,
        });
        setAdminBannerSettings({
          imageUrl: data.imageUrl || "",
          linkUrl: data.linkUrl || "",
          isActive: data.isActive || false,
        });
      }
    }, (error) => console.error("banner onSnapshot error", error));
    return () => unsub();
  }, []);

  // Load referred users data
  useEffect(() => {
    if (currentView !== "profile" || !currentUser) return;
    const q = query(
      collection(db, "users"),
      where("referredBy", "==", currentUser.uid),
      orderBy("createdAt", "desc"),
    );
    const unsub = onSnapshot(
      q,
      (snapshot) => {
        setReferredUsers(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
      },
      (error) => console.error("users/referredBy query error", error)
    );
    return () => unsub();
  }, [currentView, currentUser]);

  // Global click event for requesting notifications
  useEffect(() => {
    const handleInteraction = () => {
      requestNotificationPermission();
      document.removeEventListener("click", handleInteraction);
    };
    document.addEventListener("click", handleInteraction);
    return () => document.removeEventListener("click", handleInteraction);
  }, []);

  // Load admin data
  useEffect(() => {
    if (currentView !== "admin") return;

    let isInitialAdminLoad = true;
    // Pending withdrawals
    const qWithdrawals = query(
      collection(db, "transactions"),
      where("type", "==", "withdraw"),
      orderBy("createdAt", "asc"),
    );
    const unsubWithdrawals = onSnapshot(qWithdrawals, (snapshot) => {
      if (!isInitialAdminLoad) {
        snapshot.docChanges().forEach((change) => {
          if (change.type === "added") {
            const tx = change.doc.data();
            if (tx.status === "pending") {
              sendNotification("New Withdrawal Request", {
                body: `User requested a withdrawal of $${tx.amountUSD?.toFixed(2)}`,
              });
            }
          }
        });
      }
      setAdminWithdrawals(
        snapshot.docs.map((d) => ({ id: d.id, ...d.data() })),
      );
      isInitialAdminLoad = false;
    }, (error) => console.error("admin withdrawals query error", error));

    // Active users
    const qUsers = query(collection(db, "users"));
    const unsubUsers = onSnapshot(qUsers, (snapshot) => {
      const now = Date.now();
      let live = 0,
        daily = 0,
        weekly = 0,
        monthly = 0;
      snapshot.forEach((doc) => {
        const lastActive = doc.data().lastActiveAt || 0;
        if (now - lastActive < 5 * 60 * 1000) live++; // 5 mins
        if (now - lastActive < 24 * 60 * 60 * 1000) daily++;
        if (now - lastActive < 7 * 24 * 60 * 60 * 1000) weekly++;
        if (now - lastActive < 30 * 24 * 60 * 60 * 1000) monthly++;
      });
      setActiveUsersStats({ live, daily, weekly, monthly });
    }, (error) => console.error("users stats query error", error));

    return () => {
      unsubWithdrawals();
      unsubUsers();
    };
  }, [currentView]);

  // Localization State
  const [lang, setLang] = useState<Language>("en");
  const i18n = t[lang];

  const [showAuth, setShowAuth] = useState(false);

  // Fetch bot countries from backend
  useEffect(() => {
    fetch("/api/provider/countries?t=" + Date.now())
      .then((res) => res.json())
      .then((data) => {
        setCountries(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch bot data:", err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!currentUser) {
      setTransactions([]);
      return;
    }
    let isInitialLoad = true;
    const q = query(
      collection(db, "transactions"),
      where("userId", "==", currentUser.uid),
      orderBy("createdAt", "desc"),
    );
    const unsub = onSnapshot(
      q,
      (snapshot) => {
        if (!isInitialLoad) {
          snapshot.docChanges().forEach((change) => {
            const tx = change.doc.data();
            if (change.type === "modified") {
              if (tx.type === "withdraw" && tx.status === "paid") {
                sendNotification("Withdrawal Paid", {
                  body: `Your withdrawal of $${tx.amountUSD?.toFixed(2)} has been successfully paid.`,
                });
              }
            }
            if (change.type === "added") {
              if (tx.type === "buy") {
                sendNotification("Account Purchased!", {
                  body: `You successfully bought a new account.`,
                });
              } else if (tx.type === "deposit" && tx.status === "paid") {
                sendNotification("Deposit Successful", {
                  body: `Your deposit of $${tx.amountUSD?.toFixed(2)} was credited to your balance.`,
                });
              }
            }
          });
        }
        const txs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setTransactions(txs);
        isInitialLoad = false;
      },
      (error) => console.error("current user transactions query error", error)
    );
    return () => unsub();
  }, [currentUser]);

  // Real-time user details sync
  useEffect(() => {
    if (!currentUser) return;
    const unsub = onSnapshot(
      doc(db, "users", currentUser.uid),
      (docSnap) => {
        if (docSnap.exists()) {
          setBalanceUSD(docSnap.data().balanceUSD || 0);
          setNumericId(docSnap.data().numericId || 10000);
        }
      },
      (error) => console.error("user doc error", error)
    );
    return () => unsub();
  }, [currentUser]);



  // Track user activity
  useEffect(() => {
    if (!currentUser) return;

    const updateActivity = async () => {
      try {
        await updateDoc(doc(db, "users", currentUser.uid), {
          lastActiveAt: Date.now(),
        });
      } catch (e) {
        // ignore
      }
    };

    updateActivity();
    const interval = setInterval(updateActivity, 60000); // exactly 1 minute

    return () => clearInterval(interval);
  }, [currentUser]);

  // Auth Listener
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const refParam = urlParams.get("ref");
    const mockCheckoutParam = urlParams.get("mock_checkout");
    if (mockCheckoutParam) {
      setMockCheckout({
        method: urlParams.get("method") || "",
        amount: urlParams.get("amount") || "",
      });
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        // Check if user exists in Firestore
        const userRef = doc(db, "users", user.uid);
        try {
          const docSnap = await getDoc(userRef);
          let assignedNumericId = 10000;
          if (!docSnap.exists()) {
            // Create user profile
            try {
              await runTransaction(db, async (transaction) => {
                const counterRef = doc(db, "counters", "users");
                const counterDoc = await transaction.get(counterRef);

                let nextId = 10000;
                if (!counterDoc.exists()) {
                  transaction.set(counterRef, { lastId: 10000 });
                } else {
                  nextId = counterDoc.data().lastId + 1;
                  transaction.update(counterRef, { lastId: nextId });
                }
                assignedNumericId = nextId;

                transaction.set(userRef, {
                  uid: user.uid,
                  numericId: nextId,
                  email: user.email || "",
                  name: user.displayName || "",
                  balanceUSD: 0,
                  role: "user",
                  referredBy: refParam || null,
                  referralEarnings: 0,
                  createdAt: Date.now(),
                  updatedAt: Date.now(),
                });
              });
            } catch (tError) {
              console.error(
                "Transaction failed, creating default numeric Id:",
                tError,
              );
              // Fallback if transaction fails
              await setDoc(userRef, {
                uid: user.uid,
                numericId: 10000,
                email: user.email || "",
                name: user.displayName || "",
                balanceUSD: 0,
                role: "user",
                referredBy: refParam || null,
                referralEarnings: 0,
                createdAt: Date.now(),
                updatedAt: Date.now(),
              });
            }
          }
        } catch (error) {
          console.error("Error setting up user:", error);
        }
      } else {
        setCurrentUser(null);
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Conversion Rates
  const TOPUP_RATE = 129;
  const WITHDRAW_RATE = 125;

  const getBdtFee = (amt: number) => {
    if (amt < 500) return 10 + amt * 0.02;
    if (amt < 1000) return 8 + amt * 0.018;
    return 5 + amt * 0.015;
  };

  const getUsdFee = (amt: number) => {
    if (amt < 5) return 0.1 + amt * 0.02;
    if (amt < 10) return 0.08 + amt * 0.018;
    return 0.05 + amt * 0.015;
  };

  const handleAdminAddBalance = async () => {
    if (!adminAddBalanceUid.trim())
      return alert("Please enter a User ID or Numeric UID");
    const amount = Number(adminAddBalanceAmount);
    if (!amount || amount <= 0) return alert("Please enter a valid amount");

    try {
      let targetUserRef;
      let targetUserDoc;

      if (!isNaN(Number(adminAddBalanceUid.trim()))) {
        const q = query(
          collection(db, "users"),
          where("numericId", "==", Number(adminAddBalanceUid.trim()))
        );
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          targetUserDoc = querySnapshot.docs[0];
          targetUserRef = targetUserDoc.ref;
        }
      }

      if (!targetUserRef) {
        targetUserRef = doc(db, "users", adminAddBalanceUid.trim());
        targetUserDoc = await getDoc(targetUserRef);
      }

      if (!targetUserDoc || !targetUserDoc.exists()) {
        return alert("User not found with this UID.");
      }

      const currentTargetBalance = targetUserDoc.data().balanceUSD || 0;
      await updateDoc(targetUserRef, {
        balanceUSD: increment(amount),
      });

      // optionally add a transaction record
      const txRef = doc(collection(db, "transactions"));
      await setDoc(txRef, {
        userId: targetUserDoc.id,
        userNumericId: targetUserDoc.data().numericId,
        userEmail: targetUserDoc.data().email || "N/A",
        type: "deposit",
        amountUSD: amount,
        status: "paid",
        details: { method: "admin_topup", txId: "ADMIN-" + Date.now() },
        createdAt: Date.now(),
      });

      alert(
        `Successfully added $${amount} to user ${targetUserDoc.data().numericId || targetUserDoc.id}. Previous balance: $${currentTargetBalance.toFixed(2)}, New balance: ${(currentTargetBalance + amount).toFixed(2)}`
      );
      setAdminAddBalanceUid("");
      setAdminAddBalanceAmount("");
    } catch (error: any) {
      console.error(error);
      alert("Error adding balance: " + error.message);
    }
  };

  const handleTopup = async (method: string, overrideAmount?: number) => {
    const finalAmount =
      overrideAmount !== undefined ? overrideAmount : Number(topupAmount);

    try {
      const res = await fetch("/api/payment/topup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amountUSD: finalAmount,
          method,
          uid: currentUser?.uid,
        }),
      });
      const data = await res.json();

      if (data.payment_url && currentUser) {
        try {
          const txRef = doc(collection(db, "transactions"));
          await setDoc(txRef, {
            userId: currentUser.uid,
            type: "topup",
            amountUSD: finalAmount,
            status: "pending",
            details: { method, paymentUrl: data.payment_url },
            createdAt: Date.now(),
          });
        } catch (e: any) {
          console.error("Error creating pending topup", e);
        }

        // Redirect to payment URL
        window.open(data.payment_url, "_blank");
      } else if (data.success && currentUser) {
        alert(`Top-up request for $${finalAmount} submitted! Please wait for Admin approval. (Secure Mode)`);

        try {
          const txRef = doc(collection(db, "transactions"));
          await setDoc(txRef, {
            userId: currentUser.uid,
            type: "topup",
            amountUSD: finalAmount,
            status: "pending",
            details: { method },
            createdAt: Date.now(),
          });

          setTopupModal(false);
        } catch (e: any) {
          console.error("Error setting pending topup", e);
        }
      } else {
        alert("Payment failed: " + (data.message || "Unknown error"));
      }
    } catch (err) {
      console.error(err);
      alert("Payment request failed.");
    }
  };

  const handleBuy = async (country: CountryData, finalPrice: number) => {
    setBuyErrorId(null);
    if (balanceUSD < finalPrice) {
      setBuyErrorId(country.id);
      return;
    }
    
    if (
      window.confirm(
        `${i18n.buyConfirmTxt} ${country.country}? Price: $${finalPrice.toFixed(2)}`,
      )
    ) {
      try {
          const res = await fetch("/api/provider/buy", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ country_code: country.id }),
          });
          const data = await res.json();
          if (data.status === "ok") {
            setBalanceUSD((prev) => prev - finalPrice);
            setCountries((prev) =>
              prev.map((c) =>
                c.id === country.id ? { ...c, stock: c.stock - 1 } : c,
              ),
            );

            if (currentUser) {
              await updateDoc(doc(db, "users", currentUser.uid), {
                balanceUSD: increment(-finalPrice),
              });

              const txRef = doc(collection(db, "transactions"));
              await setDoc(txRef, {
                userId: currentUser.uid,
                type: "purchase",
                amountUSD: finalPrice,
                status: "WAIT",
                details: { phone: data.Number, country: country.country },
                createdAt: Date.now(),
              });
              setPurchasedNumber({ number: data.Number, txId: txRef.id });
            } else {
              setPurchasedNumber({ number: data.Number });
            }
            alert(i18n.buySuccessTxt);
          } else {
            alert("Failed to get number from API: " + JSON.stringify(data));
          }
        } catch (error) {
          alert("Network error while buying account.");
        }
      }
  };

  const handleGetCode = async (
    phoneToCheck?: string,
    txIdToUpdate?: string,
  ) => {
    const numberToCheck = phoneToCheck || purchasedNumber?.number;
    if (!numberToCheck) return;

    try {
      const res = await fetch("/api/provider/code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ number: numberToCheck }),
      });
      const data = await res.json();
      if (data.status === "ok" && data.code) {
        if (!phoneToCheck) {
          setPurchasedNumber((prev) =>
            prev ? { ...prev, code: data.code, pass: data.pass } : null,
          );
        }

        const txId = txIdToUpdate || purchasedNumber?.txId;
        if (txId && currentUser) {
          await updateDoc(doc(db, "transactions", txId), {
            status: "OK",
            "details.code": data.code,
            "details.pass": data.pass,
          });
        }
      } else {
        alert("Code not ready yet. Please wait a moment and try again.");
      }
    } catch (error) {
      alert("Network error while fetching code.");
    }
  };

  const renderP2pModal = () => {
    if (!p2pModal) return null;
    const price = Number(p2pModal.priceUSD);
    const platformFee = Number((price * 0.02).toFixed(2));
    const totalToPay = price + platformFee;

    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-[60]">
        <div className="bg-white rounded-xl p-4 sm:p-6 w-full max-w-md shadow-2xl">
          <h3 className="text-xl font-bold mb-4">Confirm Purchase</h3>

          <div className="bg-gray-50 p-4 rounded-lg mb-4 text-left border border-gray-200">
            <p className="text-lg font-bold text-gray-900 mb-1">
              {p2pModal.title}
            </p>
            <div className="flex justify-between items-center text-sm mb-1">
              <span className="text-gray-500">Account Price:</span>
              <span className="font-bold">${price.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-sm mb-1">
              <span className="text-gray-500">Escrow/Platform Fee (2%):</span>
              <span className="font-bold">${platformFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-lg mt-3 pt-3 border-t border-gray-300">
              <span className="text-gray-800 font-bold">Total to Pay:</span>
              <span className="font-bold text-green-600">
                ${totalToPay.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="bg-blue-50 border-l-4 border-blue-500 p-3 mb-6 rounded-r-lg">
            <p className="text-xs text-blue-800 font-medium leading-relaxed">
              <span className="font-bold">P2P Escrow Info:</span> By confirming,
              ${totalToPay.toFixed(2)} will be held in our escrow system. You
              will then enter a P2P process to receive the account ownership
              from the seller.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setP2pModal(null)}
              className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-lg hover:bg-gray-200 transition"
            >
              Cancel
            </button>
            <button
              onClick={async () => {
                if (!currentUser) return alert("Please login first.");
                if (balanceUSD < totalToPay)
                  return alert(
                    `Insufficient balance. You need $${totalToPay.toFixed(2)}.`,
                  );

                try {
                  await updateDoc(doc(db, "users", currentUser.uid), {
                    balanceUSD: increment(-totalToPay),
                  });

                  const txRef = doc(collection(db, "transactions"));
                  await setDoc(txRef, {
                    userId: currentUser.uid,
                    type: "p2p_buy",
                    amountUSD: totalToPay,
                    status: "OK",
                    details: { accountId: p2pModal.id, title: p2pModal.title },
                    createdAt: Date.now(),
                  });

                  setBalanceUSD((prev) => prev - totalToPay);

                  // Mock transferring the money to the seller
                  if (p2pModal.ownerId) {
                    try {
                      const sellerRef = doc(db, "users", p2pModal.ownerId);
                      const sellerSnap = await getDoc(sellerRef);
                      if (sellerSnap.exists()) {
                        await updateDoc(sellerRef, {
                          balanceUSD: increment(price),
                        });
                      }
                    } catch (e) {
                      console.error("Seller transfer mockup error", e);
                    }
                  }

                  // Remove account from the list (will fail securely in mock mode)
                  if (p2pModal.id && typeof p2pModal.id === "string") {
                    try {
                      await deleteDoc(doc(db, "accounts", p2pModal.id));
                    } catch (e) {
                      console.error("Secure deletion mockup error", e);
                    }
                  }

                  setP2pModal(null);
                  alert(
                    "P2P Order Pending! Support will transfer the account to you shortly. (Secure Mode)",
                  );
                } catch (error) {
                  console.error("Purchase error", error);
                  alert("Something went wrong with the purchase.");
                }
              }}
              className="flex-1 py-3 bg-[#2AABEE] hover:bg-blue-500 text-white font-bold rounded-lg transition"
            >
              Confirm & Pay
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderPurchasedModal = () => (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-[60]">
      <div className="bg-white rounded-xl p-4 sm:p-6 w-full max-w-md shadow-2xl">
        <h3 className="text-xl font-bold mb-4">{i18n.purchasedModalTitle}</h3>

        <div className="bg-gray-50 p-4 rounded-lg mb-4 text-center border border-gray-200">
          <p className="text-sm text-gray-500 mb-1">Phone Number</p>
          <p className="text-xl font-mono font-bold tracking-wider text-gray-900">
            {purchasedNumber?.number}
          </p>
        </div>

        {purchasedNumber?.code ? (
          <div className="bg-green-50 p-4 rounded-lg mb-6 text-center border border-green-200">
            <p className="text-sm text-green-800 font-bold mb-1">
              Telegram Code:
            </p>
            <p className="text-3xl font-mono font-bold text-green-700">
              {purchasedNumber.code}
            </p>
            {purchasedNumber.pass && (
              <>
                <p className="text-sm text-green-800 font-bold mb-1 mt-4">
                  Password / 2FA:
                </p>
                <p className="text-xl font-mono font-bold text-green-700">
                  {purchasedNumber.pass}
                </p>
              </>
            )}
          </div>
        ) : (
          <div className="mb-6 text-center text-sm text-gray-600 bg-blue-50 p-3 rounded-lg border border-blue-100">
            {i18n.waitingForCode}
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={() => handleGetCode()}
            className="w-full bg-[#2AABEE] text-white py-3 rounded-lg font-bold hover:bg-blue-600 transition shadow-sm"
          >
            {i18n.getCodeBtn}
          </button>

          <button
            onClick={() => setPurchasedNumber(null)}
            className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-bold hover:bg-gray-200 transition"
          >
            {i18n.closeBtn}
          </button>
        </div>
      </div>
    </div>
  );

  const renderTopupModal = () => {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl p-4 sm:p-6 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
          <h3 className="text-xl font-bold mb-4">{i18n.topupModalTitle}</h3>

          {topupStep === 1 ? (
            <div>
              <p className="text-sm text-gray-500 mb-4">
                Select a payment method:
              </p>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <button
                  onClick={() => {
                    setTopupMethod("bkash");
                    setTopupStep(2);
                  }}
                  className="w-full bg-white border border-gray-200 py-4 rounded-lg font-bold hover:bg-gray-50 transition flex flex-col items-center justify-center gap-2 shadow-sm"
                >
                  <svg className="h-8 w-auto" viewBox="-18.0015 -28.3525 156.013 170.115"><g fill="none"><path fill="#D12053" d="M96.58 62.45l-53.03-8.31 7.03 31.6z"/><path fill="#E2136E" d="M96.58 62.45L56.62 6.93 43.56 54.15z"/><path fill="#D12053" d="M42.32 53.51L.45 0l54.83 6.55z"/><path fill="#9E1638" d="M23.25 31.15L0 9.24h6.12z"/><path fill="#D12053" d="M107.89 35.46l-9.84 26.69L82.1 40.09z"/><path fill="#E2136E" d="M56.77 84.14l38.61-15.51L97 63.7z"/><path fill="#9E1638" d="M25.89 113.41l16.54-58.02 8.39 37.75z"/><path fill="#E2136E" d="M109.43 35.67l-4.06 11.02 14.64-.24z"/></g></svg>
                  <span className="text-gray-800">bKash</span>
                </button>

                <button
                  onClick={() => {
                    setTopupMethod("nagad");
                    setTopupStep(2);
                  }}
                  className="w-full bg-white border border-gray-200 py-4 rounded-lg font-bold hover:bg-gray-50 transition flex flex-col items-center justify-center gap-2 shadow-sm"
                >
                  <img src="https://freelogopng.com/images/all_img/1679248787Nagad-Logo.png" alt="Nagad" className="h-8 object-contain" onError={(e) => { e.currentTarget.src = 'https://seeklogo.com/images/N/nagad-logo-7A70CCFEE0-seeklogo.com.png'; e.currentTarget.onerror = null; }} />
                  <span className="text-gray-800">Nagad</span>
                </button>

                <button
                  onClick={() => {
                    setTopupMethod("binance");
                    setTopupStep(2);
                  }}
                  className="w-full bg-[#1e2329] text-[#f3ba2f] py-4 rounded-lg font-bold hover:bg-[#15191d] transition flex flex-col items-center justify-center gap-2 shadow-sm border border-[#2b3139]"
                >
                  <svg className="h-8 w-auto text-[#f3ba2f] fill-current" viewBox="-52.785 -88 457.47 528"><path d="M79.5 176l-39.7 39.7L0 176l39.7-39.7zM176 79.5l68.1 68.1 39.7-39.7L176 0 68.1 107.9l39.7 39.7zm136.2 56.8L272.5 176l39.7 39.7 39.7-39.7zM176 272.5l-68.1-68.1-39.7 39.7L176 352l107.8-107.9-39.7-39.7zm0-56.8l39.7-39.7-39.7-39.7-39.8 39.7z"/></svg>
                  Binance Pay
                </button>

                <button
                  onClick={() => {
                    setTopupMethod("crypto");
                    setTopupStep(2);
                  }}
                  className="w-full bg-white border border-gray-200 text-gray-800 py-4 rounded-lg font-bold hover:bg-gray-50 transition shadow-sm flex items-center justify-between px-4"
                >
                  <span>USDC, BTC, ETH & others</span>
                  <div className="flex -space-x-1">
                    <div className="w-6 h-6 rounded-full bg-[#F7931A] flex items-center justify-center p-1 border-2 border-white relative z-10">
                      <svg className="w-full h-full text-white fill-current" viewBox="0 0 24 24"><path d="M14.4 12c1.32-.48 2.28-1.56 2.28-3.12 0-2.4-1.92-3.72-4.92-3.72H6.6v15.6h3.48v-2.16h1.8c3.24 0 5.4-1.56 5.4-4.2 0-1.8-1.2-3.12-2.88-3.6V12zm-3.84-4.32h1.56c1.2 0 1.92.6 1.92 1.56s-.72 1.56-1.92 1.56h-1.56V7.68zm1.92 8.16h-1.92v-3.36h1.92c1.32 0 2.28.6 2.28 1.68s-.96 1.68-2.28 1.68z"/></svg>
                    </div>
                    <div className="w-6 h-6 rounded-full bg-[#627EEA] flex items-center justify-center p-1 border-2 border-white relative z-0">
                      <svg className="w-full h-full text-white fill-current" viewBox="0 0 24 24"><path d="M11.944 17.97L4.58 13.62 11.943 24l7.37-10.38-7.372 4.35h.003zM12.056 0L4.69 12.22l7.365 4.339 7.365-4.34L12.056 0z"/></svg>
                    </div>
                  </div>
                </button>
              </div>
              {transactions.filter(
                (t) => t.type === "topup" && t.status === "pending",
              ).length > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm font-bold text-gray-700 mb-2">
                    Pending Payments
                  </h3>
                  <div className="space-y-2 max-h-32 overflow-y-auto pr-1">
                    {transactions
                      .filter(
                        (t) => t.type === "topup" && t.status === "pending",
                      )
                      .map((tx) => (
                        <div
                          key={tx.id}
                          className="bg-orange-50 p-3 rounded-lg flex items-center justify-between border border-orange-100"
                        >
                          <div>
                            <p className="font-bold text-sm text-orange-800 capitalize">
                              {tx.details?.method || "Top-up"}{" "}
                              <span className="font-normal text-orange-600">
                                (Not Paid)
                              </span>
                            </p>
                            <p className="text-xs text-orange-600 mt-1">
                              ${tx.amountUSD?.toFixed(2)} USD
                            </p>
                          </div>
                          {tx.details?.paymentUrl && (
                            <a
                              href={tx.details.paymentUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="bg-orange-500 text-white px-4 py-1.5 rounded-md text-sm font-bold hover:bg-orange-600 transition shadow-sm"
                            >
                              Pay Now
                            </a>
                          )}
                        </div>
                      ))}
                  </div>
                </div>
              )}
              <button
                onClick={() => {
                  setTopupModal(false);
                  setTopupStep(1);
                  setTopupMethod(null);
                }}
                className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-bold hover:bg-gray-200 transition"
              >
                {i18n.cancelBtn}
              </button>
            </div>
          ) : (
            <div>
              {topupMethod === "bkash" || topupMethod === "nagad" ? (
                <>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Amount to deposit (BDT)
                    </label>
                    <input
                      type="number"
                      min="100"
                      placeholder="Minimum 100 BDT"
                      value={topupInputBdt}
                      onChange={(e) =>
                        setTopupInputBdt(
                          e.target.value === "" ? "" : Number(e.target.value),
                        )
                      }
                      className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#2AABEE]"
                    />
                  </div>
                  <div className="bg-blue-50 text-blue-800 p-3 rounded-lg mb-6 text-sm font-medium">
                    <div className="flex justify-between mb-1">
                      <span>Wallet Credit:</span>{" "}
                      <span className="font-bold text-green-600">
                        +${(Number(topupInputBdt) / TOPUP_RATE).toFixed(2)} USD
                      </span>
                    </div>
                    <div className="flex justify-between mb-2 text-xs text-blue-600">
                      <span>Gateway Fee:</span>{" "}
                      <span>
                        +{getBdtFee(Number(topupInputBdt)).toFixed(2)} BDT
                      </span>
                    </div>
                    <div className="flex justify-between border-t border-blue-200 pt-2 font-bold text-lg">
                      <span>
                        Total Pay ({topupMethod === "bkash" ? "bKash" : "Nagad"}
                        ):
                      </span>{" "}
                      <span>
                        {(
                          Number(topupInputBdt) +
                          getBdtFee(Number(topupInputBdt))
                        ).toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}{" "}
                        BDT
                      </span>
                    </div>
                  </div>
                  {topupError && (
                    <div className="mb-4 bg-red-50 text-red-600 p-3 rounded-lg border border-red-200 text-sm font-bold animate-in fade-in slide-in-from-top-2">
                      {topupError}
                    </div>
                  )}
                    <button
                    onClick={() => {
                      setTopupError("");
                      const enteredBDT = Number(topupInputBdt);
                      if (!enteredBDT || enteredBDT < 100) {
                        setTopupError("Minimum top-up amount is 100 BDT.");
                        return;
                      }
                      const amountUSDToPass = enteredBDT / TOPUP_RATE;
                      setTopupAmount(amountUSDToPass);
                      setTopupError("");
                      handleTopup(topupMethod, amountUSDToPass);
                    }}
                    className={`w-full text-gray-900 py-3 rounded-lg font-bold transition flex items-center justify-center gap-2 mb-2 bg-white border border-gray-200 hover:bg-gray-50 shadow-sm`}
                  >
                    {topupMethod === "bkash" ? <svg className="h-6 w-auto" viewBox="-18.0015 -28.3525 156.013 170.115"><g fill="none"><path fill="#D12053" d="M96.58 62.45l-53.03-8.31 7.03 31.6z"/><path fill="#E2136E" d="M96.58 62.45L56.62 6.93 43.56 54.15z"/><path fill="#D12053" d="M42.32 53.51L.45 0l54.83 6.55z"/><path fill="#9E1638" d="M23.25 31.15L0 9.24h6.12z"/><path fill="#D12053" d="M107.89 35.46l-9.84 26.69L82.1 40.09z"/><path fill="#E2136E" d="M56.77 84.14l38.61-15.51L97 63.7z"/><path fill="#9E1638" d="M25.89 113.41l16.54-58.02 8.39 37.75z"/><path fill="#E2136E" d="M109.43 35.67l-4.06 11.02 14.64-.24z"/></g></svg> : <img src="https://freelogopng.com/images/all_img/1679248787Nagad-Logo.png" alt="Nagad" className="h-6 object-contain" onError={(e) => { e.currentTarget.src = 'https://seeklogo.com/images/N/nagad-logo-7A70CCFEE0-seeklogo.com.png'; e.currentTarget.onerror = null; }} />}
                    Pay with {topupMethod === "bkash" ? "bKash" : "Nagad"}
                  </button>
                </>
              ) : (
                <>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Amount to deposit (USD)
                    </label>
                    <input
                      type="number"
                      min="1"
                      placeholder="Minimum 1 USD"
                      value={topupInputUsd}
                      onChange={(e) =>
                        setTopupInputUsd(
                          e.target.value === "" ? "" : Number(e.target.value),
                        )
                      }
                      className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#2AABEE]"
                    />
                  </div>
                  <div className="bg-gray-50 text-gray-800 p-3 rounded-lg mb-6 text-sm font-medium">
                    <div className="flex justify-between mb-1">
                      <span>Wallet Credit:</span>{" "}
                      <span className="font-bold text-green-600">
                        +${Number(topupInputUsd).toFixed(2)} USD
                      </span>
                    </div>
                    <div className="flex justify-between mb-2 text-xs text-gray-500">
                      <span>Gateway Fee:</span>{" "}
                      <span>
                        +${getUsdFee(Number(topupInputUsd)).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between border-t border-gray-200 pt-2 font-bold text-lg">
                      <span>
                        Total Pay ({topupMethod === "binance" ? "Binance Pay" : "Crypto"}):
                      </span>{" "}
                      <span>
                        $
                        {(
                          Number(topupInputUsd) +
                          getUsdFee(Number(topupInputUsd))
                        ).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="bg-blue-50 border-l-4 border-blue-500 p-3 mb-4 rounded-r-lg">
                    <p className="text-sm text-blue-800 font-medium leading-relaxed">
                      <span className="font-bold">Important Instruction:</span>{" "}
                      {topupMethod === "binance" ? "In Paymently, choose Global and select Binance Pay to complete your transaction in USD." : "You will be redirected directly to the Crypto gateway to complete your transaction securely."}
                    </p>
                  </div>

                  {topupError && (
                    <div className="mb-4 bg-red-50 text-red-600 p-3 rounded-lg border border-red-200 text-sm font-bold animate-in fade-in slide-in-from-top-2">
                      {topupError}
                    </div>
                  )}
                  <button
                    onClick={() => {
                      setTopupError("");
                      const enteredUSD = Number(topupInputUsd);
                      if (!enteredUSD || enteredUSD < 1) {
                        setTopupError("Minimum top-up amount is 1 USD.");
                        return;
                      }
                      setTopupAmount(enteredUSD);
                      setTopupError("");
                      handleTopup(topupMethod!, enteredUSD);
                    }}
                    className={`w-full py-3 rounded-lg font-bold transition flex items-center justify-center gap-2 mb-2 ${topupMethod === "binance" ? "bg-[#1e2329] text-[#f3ba2f] hover:bg-[#15191d]" : "bg-white border border-gray-200 text-gray-800 hover:bg-gray-50"} shadow-sm`}
                  >
                    {topupMethod === "binance" ? <svg className="h-6 w-auto text-[#f3ba2f] fill-current" viewBox="-52.785 -88 457.47 528"><path d="M79.5 176l-39.7 39.7L0 176l39.7-39.7zM176 79.5l68.1 68.1 39.7-39.7L176 0 68.1 107.9l39.7 39.7zm136.2 56.8L272.5 176l39.7 39.7 39.7-39.7zM176 272.5l-68.1-68.1-39.7 39.7L176 352l107.8-107.9-39.7-39.7zm0-56.8l39.7-39.7-39.7-39.7-39.8 39.7z"/></svg> : (
                      <div className="flex -space-x-1 mr-1">
                        <div className="w-5 h-5 rounded-full bg-[#F7931A] flex items-center justify-center p-0.5 border-2 border-white relative z-10">
                          <svg className="w-full h-full text-white fill-current" viewBox="0 0 24 24"><path d="M14.4 12c1.32-.48 2.28-1.56 2.28-3.12 0-2.4-1.92-3.72-4.92-3.72H6.6v15.6h3.48v-2.16h1.8c3.24 0 5.4-1.56 5.4-4.2 0-1.8-1.2-3.12-2.88-3.6V12zm-3.84-4.32h1.56c1.2 0 1.92.6 1.92 1.56s-.72 1.56-1.92 1.56h-1.56V7.68zm1.92 8.16h-1.92v-3.36h1.92c1.32 0 2.28.6 2.28 1.68s-.96 1.68-2.28 1.68z"/></svg>
                        </div>
                        <div className="w-5 h-5 rounded-full bg-[#627EEA] flex items-center justify-center p-0.5 border-2 border-white relative z-0">
                          <svg className="w-full h-full text-white fill-current" viewBox="0 0 24 24"><path d="M11.944 17.97L4.58 13.62 11.943 24l7.37-10.38-7.372 4.35h.003zM12.056 0L4.69 12.22l7.365 4.339 7.365-4.34L12.056 0z"/></svg>
                        </div>
                      </div>
                    )}
                    <span>Pay with {topupMethod === "binance" ? "Binance Pay" : "Crypto"}</span>
                  </button>
                </>
              )}

              <button
                onClick={() => {
                  setTopupStep(1);
                }}
                className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-bold hover:bg-gray-200 transition mt-2"
              >
                Back
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderWithdrawModal = () => {
    const enteredAmount = Number(withdrawAmount) || 0;
    const displayAmount = Math.max(0, enteredAmount);
    const baseBdt = displayAmount * WITHDRAW_RATE;
    const bdtFee = getBdtFee(baseBdt);
    const totalGetBdt = Math.max(0, baseBdt - bdtFee);

    const baseUsd = displayAmount;
    const usdFee = getUsdFee(baseUsd);
    const totalGetUsd = Math.max(0, baseUsd - usdFee);

    return (
      <div className="fixed inset-0 bg-black/50 flex flex-col items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl p-4 sm:p-6 w-full max-w-lg shadow-2xl max-h-[90vh] flex flex-col">
          <h3 className="text-xl font-bold mb-4">{i18n.withdrawModalTitle}</h3>

          <div className="flex bg-gray-100 rounded-lg p-1 mb-4 flex-wrap gap-1">
            {["Binance", "BSC-USDT", "bKash", "Nagad"].map((method) => (
              <button
                key={method}
                onClick={() => setWithdrawMethod(method as any)}
                className={`flex-1 min-w-[70px] px-3 py-2 rounded-md font-bold text-sm transition-all ${withdrawMethod === method ? "bg-white shadow text-[#2AABEE]" : "text-gray-500 hover:text-gray-700"}`}
              >
                {method}
              </button>
            ))}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {i18n.amountUsdLbl}
            </label>
            <input
              type="number"
              min="1"
              max={balanceUSD}
              placeholder="Minimum 1 USD"
              value={withdrawAmount}
              onChange={(e) =>
                setWithdrawAmount(
                  e.target.value === "" ? "" : Number(e.target.value),
                )
              }
              className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#2AABEE]"
            />
            <p className="text-xs text-gray-500 mt-1">
              {i18n.availWithdrawLbl} ${balanceUSD.toFixed(2)}
            </p>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {withdrawMethod === "bKash" || withdrawMethod === "Nagad"
                ? `${withdrawMethod} Personal Number`
                : withdrawMethod === "Binance"
                  ? "Binance Pay ID or Email"
                  : "BSC-USDT Address"}
            </label>
            <input
              type="text"
              value={withdrawDetails}
              onChange={(e) => setWithdrawDetails(e.target.value)}
              placeholder={
                withdrawMethod === "bKash" || withdrawMethod === "Nagad"
                  ? `Enter your ${withdrawMethod} personal number`
                  : withdrawMethod === "Binance"
                    ? "Enter your Binance Pay ID or Email"
                    : "Enter your BSC Network USDT Address"
              }
              className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#2AABEE]"
            />
            {withdrawMethod === "Binance" && (
              <p className="text-xs text-gray-500 mt-1">
                Please provide your Binance Pay ID or Email. We do not use payment links.
              </p>
            )}
            {withdrawMethod === "BSC-USDT" && (
              <p className="text-xs text-gray-500 mt-1">
                Make sure you provide a valid USDT address on the BSC (BEP20)
                network.
              </p>
            )}
            {(withdrawMethod === "bKash" || withdrawMethod === "Nagad") && (
              <p className="text-xs text-gray-500 mt-1">
                Please provide a valid personal account number.
              </p>
            )}
          </div>

          <div className="bg-green-50 text-green-800 p-3 rounded-lg mb-4 text-sm font-medium shrink-0">
            {withdrawMethod === "Binance" || withdrawMethod === "BSC-USDT" ? (
              <div className="flex flex-col gap-1">
                <span>Rate: 1 USD = 1 USD</span>
                <span className="text-gray-500">Fee: ${usdFee.toFixed(2)}</span>
                <span>
                  Total Get:{" "}
                  <span className="font-bold text-lg">
                    ${totalGetUsd.toFixed(2)}
                  </span>
                </span>
              </div>
            ) : (
              <div className="flex flex-col gap-1">
                <span>
                  {i18n.rateLbl} {WITHDRAW_RATE} BDT
                </span>
                <span className="text-gray-500">
                  Fee: {bdtFee.toLocaleString()} BDT
                </span>
                <span>
                  {i18n.totalGetLbl}{" "}
                  <span className="font-bold text-lg">
                    {totalGetBdt.toLocaleString()} BDT
                  </span>
                </span>
              </div>
            )}
          </div>

          <p className="text-xs text-orange-600 font-medium mb-6 bg-orange-50 p-2 rounded shrink-0">
            {i18n.manualWithdrawNote}
          </p>

          {withdrawError && (
            <div className="mb-4 bg-red-50 text-red-600 p-3 rounded-lg border border-red-200 text-sm font-bold animate-in fade-in slide-in-from-top-2">
              {withdrawError}
            </div>
          )}

          <div className="space-y-3 shrink-0">
            <button
              onClick={async () => {
                setWithdrawError("");
                const amountObj = Number(withdrawAmount);
                if (!amountObj || amountObj < 1) {
                  setWithdrawError("Minimum withdrawal amount is 1 USD");
                  return;
                }
                if (amountObj > balanceUSD) {
                  setWithdrawError("Insufficient balance for this withdrawal");
                  return;
                }
                if (!withdrawDetails.trim()) {
                  setWithdrawError(`Please enter your ${withdrawMethod} details`);
                  return;
                }
                if (currentUser) {
                  try {
                    await updateDoc(doc(db, "users", currentUser.uid), {
                      balanceUSD: increment(-amountObj),
                    });
                    const txRef = doc(collection(db, "transactions"));
                    await setDoc(txRef, {
                      userId: currentUser.uid,
                      userNumericId: numericId,
                      userEmail: currentUser.email || "N/A",
                      type: "withdraw",
                      amountUSD: amountObj,
                      status: "pending",
                      details: {
                        method: withdrawMethod,
                        account: withdrawDetails,
                        payoutUsd: totalGetUsd,
                        payoutBdt: totalGetBdt,
                      },
                      createdAt: Date.now(),
                    });
                    alert(i18n.withdrawSuccessTxt);
                    setBalanceUSD((prev) => prev - amountObj);
                    setWithdrawModal(false);
                  } catch (e: any) {
                    alert("Error during withdrawal: " + e.message);
                    console.error(e);
                  }
                }
              }}
              className="w-full bg-green-500 text-white py-3 rounded-lg font-bold hover:bg-green-600 transition"
            >
              {i18n.withdrawSubmitBtn}
            </button>

            <button
              onClick={() => setWithdrawModal(false)}
              className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-bold hover:bg-gray-200 transition"
            >
              {i18n.cancelBtn}
            </button>
          </div>

          <div className="mt-8 border-t border-gray-200 pt-4 flex-1 overflow-auto">
            <h4 className="font-bold text-gray-800 mb-3">Withdrawal History</h4>
            <div className="space-y-2">
              {transactions.filter((t) => t.type === "withdraw").length ===
              0 ? (
                <p className="text-sm text-gray-500 italic">
                  No previous withdrawals.
                </p>
              ) : (
                transactions
                  .filter((t) => t.type === "withdraw")
                  .map((tx) => (
                    <div
                      key={tx.id}
                      className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100"
                    >
                      <div>
                        <p className="font-bold text-gray-800">
                          ${tx.amountUSD.toFixed(2)} USD
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(tx.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        {tx.status === "paid" ? (
                          <span className="text-xs font-bold bg-green-100 text-green-700 px-2 py-1 rounded uppercase">
                            Paid
                          </span>
                        ) : (
                          <span className="text-xs font-bold bg-yellow-100 text-yellow-700 px-2 py-1 rounded uppercase">
                            Pending
                          </span>
                        )}
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2AABEE]"></div>
      </div>
    );
  }

  if (!currentUser) {
    if (showAuth) {
      return (
        <Login
          lang={lang}
          setLang={setLang}
          onBack={() => setShowAuth(false)}
        />
      );
    }
    return (
      <Landing
        lang={lang}
        setLang={setLang}
        onGetStarted={() => setShowAuth(true)}
        countries={countries}
        markupPercent={markupPercent}
      />
    );
  }

  if (!currentUser.emailVerified) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans">
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 max-w-md w-full text-center">
          <Mail className="w-16 h-16 text-[#2AABEE] mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Verify your email
          </h2>
          <p className="text-gray-600 mb-6">
            We need to verify your email address before you can continue. Please
            verify <strong>{currentUser.email}</strong>.
          </p>
          <div className="space-y-3">
            <button
              onClick={async () => {
                try {
                  await sendEmailVerification(currentUser);
                  alert(
                    "Verification email sent! Please check your inbox (and spam folder).",
                  );
                } catch (e: any) {
                  alert("Error: " + e.message);
                }
              }}
              className="w-full bg-[#2AABEE] text-white py-2.5 rounded-lg font-bold hover:bg-[#209adf] transition shadow-sm"
            >
              Send Verification Email
            </button>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-gray-100 text-gray-700 py-2.5 rounded-lg font-bold hover:bg-gray-200 transition"
            >
              I've verified my email
            </button>
            <button
              onClick={() => auth.signOut()}
              className="w-full text-red-500 py-2.5 font-bold hover:underline"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (mockCheckout) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans">
        <div className="bg-white p-8 rounded-xl shadow-xl w-full max-w-md border border-gray-100 flex flex-col items-center">
          <div
            className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 shadow-md ${mockCheckout.method === "binance" ? "bg-[#f3ba2f] text-[#1e2329]" : mockCheckout.method === "crypto" ? "bg-[#4C51F7] text-white" : mockCheckout.method === "bkash" ? "bg-[#E2136E] text-white" : "bg-[#F04D26] text-white"}`}
          >
            {mockCheckout.method === "crypto" || mockCheckout.method === "binance" ? (
              <Wallet className="w-10 h-10" />
            ) : (
              <Smartphone className="w-10 h-10" />
            )}
          </div>

          <h2 className="text-2xl font-bold mb-2">Checkout Mockup</h2>
          <p className="text-gray-500 text-center mb-6">
            You are simulating a payment using{" "}
            <span className="font-bold text-gray-800 capitalize">
              {mockCheckout.method}
            </span>
            .
          </p>

          <div className="w-full bg-gray-50 rounded-xl p-6 border border-gray-100 mb-8 flex flex-col items-center justify-center gap-2">
            <span className="text-sm font-medium text-gray-500 uppercase tracking-widest">
              Amount to Pay
            </span>
            <span className="text-4xl font-extrabold text-gray-900">
              ${mockCheckout.amount}
            </span>
          </div>

          <div className="w-full flex gap-3">
            <button
              onClick={() => {
                window.location.href = "/?payment=cancel";
              }}
              className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-lg hover:bg-gray-200 transition"
            >
              Cancel
            </button>
            <button
              onClick={async () => {
                if (!currentUser) return;
                try {
                  const txRef = doc(collection(db, "transactions"));
                  await setDoc(txRef, {
                    userId: currentUser.uid,
                    type: "topup",
                    amountUSD: Number(mockCheckout.amount),
                    status: "pending",
                    details: { method: mockCheckout.method },
                    createdAt: Date.now(),
                  });
                } catch (e) {
                  console.error("Mock checkout error", e);
                }
                window.location.href = "/?payment=success&msg=Waiting for Admin Approval";
              }}
              className="flex-[2] py-3 bg-[#2AABEE] text-white font-bold rounded-lg shadow-lg hover:bg-blue-500 transition"
            >
              Simulate Success
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 flex flex-col">
      <AnimatePresence>
        {showWelcome && (
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          >
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-6 md:p-8 max-w-md w-full relative">
              <button
                onClick={() => setShowWelcome(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition p-1 hover:bg-gray-100 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex flex-col items-center text-center">
                <div className="mb-6">
                  <TelemarketLogo className="h-16 text-[#2AABEE]" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Welcome to TeleMarket!
                </h2>
                <div className="text-gray-600 mb-6 text-sm leading-relaxed space-y-2">
                  <p>
                    The premier marketplace to securely buy and sell Telegram
                    accounts.
                  </p>
                  <p>
                    Browse our directory of verified and highly active
                    accounts. Start earning with confidence today.
                  </p>
                </div>
                <button
                  onClick={() => setShowWelcome(false)}
                  className="w-full bg-[#2AABEE] hover:bg-[#2299d6] text-white font-bold py-3 px-6 rounded-xl transition shadow-lg shadow-blue-500/30 active:scale-[0.98]"
                >
                  Explore Now
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <TopTicker />
      {/* Navbar */}
      <header className="bg-[#2AABEE] text-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="w-full flex justify-between items-center md:w-auto">
            <div
              className="flex items-center space-x-2 cursor-pointer"
              onClick={() => setCurrentView("buy")}
            >
              <TelemarketLogo className="h-10 md:h-12 text-white drop-shadow-md" />
            </div>

            {/* Mobile Actions */}
            <div className="flex md:hidden items-center gap-2">
              {numericId && (
                <div className="bg-white/20 text-white px-2 py-1 rounded text-xs font-bold font-mono border border-white/30 hidden sm:flex items-center">
                  UID: {numericId}
                </div>
              )}
              <div className="flex items-center gap-1 text-white bg-black/10 px-2 py-1 rounded-lg">
                <Globe className="w-4 h-4 opacity-80" />
                <select
                  value={lang}
                  onChange={(e) => setLang(e.target.value as Language)}
                  className="bg-transparent border-none text-white outline-none cursor-pointer text-xs font-medium appearance-none"
                >
                  <option value="en" className="text-gray-900">EN</option>
                  <option value="bn" className="text-gray-900">BN</option>
                  <option value="hi" className="text-gray-900">HI</option>
                  <option value="es" className="text-gray-900">ES</option>
                  <option value="ar" className="text-gray-900">AR</option>
                  <option value="ru" className="text-gray-900">RU</option>
                  <option value="pt" className="text-gray-900">PT</option>
                  <option value="fr" className="text-gray-900">FR</option>
                  <option value="de" className="text-gray-900">DE</option>
                  <option value="zh" className="text-gray-900">ZH</option>
                  <option value="ja" className="text-gray-900">JA</option>
                  <option value="ko" className="text-gray-900">KO</option>
                  <option value="tr" className="text-gray-900">TR</option>
                  <option value="id" className="text-gray-900">ID</option>
                  <option value="ur" className="text-gray-900">UR</option>
                  <option value="it" className="text-gray-900">IT</option>
                  <option value="nl" className="text-gray-900">NL</option>
                  <option value="pl" className="text-gray-900">PL</option>
                  <option value="vi" className="text-gray-900">VI</option>
                  <option value="th" className="text-gray-900">TH</option>
                </select>
              </div>
              <button
                onClick={() => signOut(auth)}
                className="flex items-center justify-center bg-red-500/80 hover:bg-red-500 text-white p-2 rounded-lg text-xs font-bold transition"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="flex items-center justify-center bg-black/20 hover:bg-black/30 text-white p-2 rounded-lg transition"
              >
                {isMobileMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          <div className="hidden md:block w-full md:w-auto overflow-x-auto pb-1 no-scrollbar">
            <nav className="flex items-center gap-2 font-medium min-w-max">
              <button
                onClick={() => setCurrentView("dashboard")}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition text-sm ${currentView === "dashboard" ? "bg-black/20 text-white font-bold" : "hover:bg-black/10"}`}
              >
                <LayoutDashboard className="w-4 h-4 shrink-0" />
                <span className="whitespace-nowrap">{i18n.dashboardNav}</span>
              </button>
              <button
                onClick={() => setCurrentView("buy")}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition text-sm ${currentView === "buy" ? "bg-black/20 text-white font-bold" : "hover:bg-black/10"}`}
              >
                <ShoppingCart className="w-4 h-4 shrink-0" />
                <span className="whitespace-nowrap">{i18n.buyNav}</span>
              </button>

              <button
                onClick={() => setCurrentView("sell")}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition text-sm ${currentView === "sell" ? "bg-black/20 text-white font-bold" : "hover:bg-black/10"}`}
              >
                <PlusCircle className="w-4 h-4 shrink-0" />
                <span className="whitespace-nowrap">{i18n.sellNav}</span>
              </button>

              <button
                onClick={() => setCurrentView("records")}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition text-sm ${currentView === "records" ? "bg-black/20 text-white font-bold" : "hover:bg-black/10"}`}
              >
                <FileText className="w-4 h-4 shrink-0" />
                <span className="whitespace-nowrap">
                  {i18n.recordsNav || "Record buy/sell"}
                </span>
              </button>
              <button
                onClick={() => setCurrentView("profile")}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition text-sm ${currentView === "profile" ? "bg-black/20 text-white font-bold" : "hover:bg-black/10"}`}
              >
                <User className="w-4 h-4 shrink-0" />
                <span className="whitespace-nowrap">
                  {i18n.profileNav || "Profile"}
                </span>
              </button>
              {currentUser?.email &&
              (currentUser.email === "admin@gmail.com" ||
                currentUser.email === "uzvsbdnzyxhzj@gmail.com") ? (
                <button
                  onClick={() => setCurrentView("admin")}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition text-sm bg-red-500 hover:bg-red-600 ${currentView === "admin" ? "ring-2 ring-white/50 font-bold" : ""}`}
                >
                  <Settings className="w-4 h-4 shrink-0" />
                  <span className="whitespace-nowrap">{i18n.adminNav}</span>
                </button>
              ) : null}
            </nav>
          </div>

          {/* Expanded Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="w-full md:hidden flex flex-col gap-2 mt-2 bg-black/10 p-2 rounded-xl">
              <button
                onClick={() => {
                  setCurrentView("dashboard");
                  setIsMobileMenuOpen(false);
                }}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg transition text-sm ${currentView === "dashboard" ? "bg-black/20 text-white font-bold" : "hover:bg-black/10"}`}
              >
                <LayoutDashboard className="w-5 h-5 shrink-0" />
                <span>{i18n.dashboardNav}</span>
              </button>
              <button
                onClick={() => {
                  setCurrentView("buy");
                  setIsMobileMenuOpen(false);
                }}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg transition text-sm ${currentView === "buy" ? "bg-black/20 text-white font-bold" : "hover:bg-black/10"}`}
              >
                <ShoppingCart className="w-5 h-5 shrink-0" />
                <span>{i18n.buyNav}</span>
              </button>

              <button
                onClick={() => {
                  setCurrentView("sell");
                  setIsMobileMenuOpen(false);
                }}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg transition text-sm ${currentView === "sell" ? "bg-black/20 text-white font-bold" : "hover:bg-black/10"}`}
              >
                <PlusCircle className="w-5 h-5 shrink-0" />
                <span>{i18n.sellNav}</span>
              </button>

              <button
                onClick={() => {
                  setCurrentView("records");
                  setIsMobileMenuOpen(false);
                }}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg transition text-sm ${currentView === "records" ? "bg-black/20 text-white font-bold" : "hover:bg-black/10"}`}
              >
                <FileText className="w-5 h-5 shrink-0" />
                <span>{i18n.recordsNav || "Record buy/sell"}</span>
              </button>
              <button
                onClick={() => {
                  setCurrentView("profile");
                  setIsMobileMenuOpen(false);
                }}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg transition text-sm ${currentView === "profile" ? "bg-black/20 text-white font-bold" : "hover:bg-black/10"}`}
              >
                <User className="w-5 h-5 shrink-0" />
                <span>{i18n.profileNav || "Profile"}</span>
              </button>
              <button
                onClick={() => {
                  setTopupModal(true);
                  setIsMobileMenuOpen(false);
                }}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg transition text-sm hover:bg-black/10`}
              >
                <ShoppingCart className="w-5 h-5 shrink-0" />
                <span>Top Up</span>
              </button>
              <button
                onClick={() => {
                  setWithdrawModal(true);
                  setIsMobileMenuOpen(false);
                }}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg transition text-sm hover:bg-black/10`}
              >
                <Wallet className="w-5 h-5 shrink-0" />
                <span>Withdraw</span>
              </button>
              {currentUser?.email &&
              (currentUser.email === "admin@gmail.com" ||
                currentUser.email === "uzvsbdnzyxhzj@gmail.com") ? (
                <button
                  onClick={() => {
                    setCurrentView("admin");
                    setIsMobileMenuOpen(false);
                  }}
                  className={`flex items-center gap-2 px-4 py-3 rounded-lg transition text-sm bg-red-500 hover:bg-red-600 ${currentView === "admin" ? "ring-2 ring-white/50 font-bold" : ""}`}
                >
                  <Settings className="w-5 h-5 shrink-0" />
                  <span>{i18n.adminNav}</span>
                </button>
              ) : null}
            </div>
          )}

          <div className="hidden md:flex items-center gap-4">
            {/* Language Selector (Google Translate) desktop */}
            <div className="flex flex-col md:flex-row items-center gap-2">
              {numericId && (
                <div className="bg-white/20 text-white px-2 py-1 rounded text-xs font-bold font-mono border border-white/30 hidden sm:flex items-center">
                  UID: {numericId}
                </div>
              )}
              <div className="flex items-center gap-1 text-white bg-black/10 px-2 py-1 rounded-lg">
                <Globe className="w-4 h-4 opacity-80" />
                <select
                  value={lang}
                  onChange={(e) => setLang(e.target.value as Language)}
                  className="bg-transparent border-none text-white outline-none cursor-pointer text-xs md:text-sm font-medium"
                >
                  <option value="en" className="text-gray-900">English</option>
                  <option value="bn" className="text-gray-900">বাংলা (Bengali)</option>
                  <option value="hi" className="text-gray-900">हिन्दी (Hindi)</option>
                  <option value="es" className="text-gray-900">Español (Spanish)</option>
                  <option value="ar" className="text-gray-900">العربية (Arabic)</option>
                  <option value="ru" className="text-gray-900">Русский (Russian)</option>
                  <option value="pt" className="text-gray-900">Português (Portuguese)</option>
                  <option value="fr" className="text-gray-900">Français (French)</option>
                  <option value="de" className="text-gray-900">Deutsch (German)</option>
                  <option value="zh" className="text-gray-900">中文 (Chinese)</option>
                  <option value="ja" className="text-gray-900">日本語 (Japanese)</option>
                  <option value="ko" className="text-gray-900">한국어 (Korean)</option>
                  <option value="tr" className="text-gray-900">Türkçe (Turkish)</option>
                  <option value="id" className="text-gray-900">Bahasa Indonesia</option>
                  <option value="ur" className="text-gray-900">اردو (Urdu)</option>
                  <option value="it" className="text-gray-900">Italiano (Italian)</option>
                  <option value="nl" className="text-gray-900">Nederlands (Dutch)</option>
                  <option value="pl" className="text-gray-900">Polski (Polish)</option>
                  <option value="vi" className="text-gray-900">Tiếng Việt (Vietnamese)</option>
                  <option value="th" className="text-gray-900">ไทย (Thai)</option>
                </select>
              </div>
            </div>

            <button
              onClick={() => signOut(auth)}
              className="flex items-center gap-1 bg-red-500/80 hover:bg-red-500 text-white px-2 py-1.5 rounded-lg text-xs font-bold transition ml-2"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden md:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <AdvertisementBanner />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* BUY VIEW */}
        {currentView === "buy" && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-800">
                  {i18n.liveBuyTitle}
                </h2>
                <p className="text-gray-500 mt-1 text-sm md:text-base">
                  {i18n.liveBuySub}
                </p>
              </div>
              <div className="hidden md:flex bg-blue-50 text-blue-700 px-4 py-2 rounded-lg items-center gap-2 font-medium border border-blue-100">
                <CheckCircle className="w-5 h-5" />
                {i18n.autoSystem}
              </div>
            </div>

            {
              loading ? (
                <div className="flex justify-center items-center py-20">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2AABEE]"></div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {countries.map((c) => {
                    const finalPrice =
                      c.basePrice + (c.basePrice * markupPercent) / 100;

                    return (
                      <div
                        key={c.id}
                        className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="text-lg font-bold text-gray-900">
                                {c.flag || getFlag(c.country, c.code)}{" "}
                                {c.country}
                              </h3>
                              <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded mt-1 inline-block">
                                {c.code}
                              </span>
                            </div>
                            <div className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm font-bold border border-green-200">
                              ${finalPrice.toFixed(2)}
                            </div>
                          </div>

                          <div className="flex items-center justify-between mb-5 text-sm">
                            <span className="text-gray-600">
                              {i18n.stockLbl}
                            </span>
                            <span
                              className={`font-bold ${c.stock > 0 ? "text-green-600" : "text-red-500"}`}
                            >
                              {c.stock > 0
                                ? `${c.stock} ${i18n.pcs}`
                                : i18n.outOfStock}
                            </span>
                          </div>
                        </div>

                        <button
                          disabled={c.stock === 0}
                          onClick={() => handleBuy(c, finalPrice)}
                          className={`w-full py-2.5 rounded-lg font-medium transition flex items-center justify-center gap-2 mt-auto ${
                            c.stock > 0
                              ? "bg-[#2AABEE] hover:bg-blue-500 text-white"
                              : "bg-gray-100 text-gray-400 cursor-not-allowed"
                          }`}
                        >
                          <ShoppingCart className="w-5 h-5" />
                          {c.stock > 0 ? i18n.buyBtn : i18n.outOfStock}
                        </button>
                        {buyErrorId === c.id && (
                          <div className="mt-3 bg-red-50 text-red-600 p-3 rounded-lg border border-red-200 text-center animate-in fade-in slide-in-from-top-2">
                            <p className="font-bold text-sm mb-2">Insufficient balance!</p>
                            <button 
                              onClick={() => {
                                setBuyErrorId(null);
                                setTopupModal(true);
                              }}
                              className="w-full bg-red-100 hover:bg-red-200 text-red-700 py-2 rounded-lg font-bold text-sm transition"
                            >
                              Top Up Now
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
          </div>
        )}

        {/* SELL VIEW */}
        {currentView === "sell" && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center max-w-2xl mx-auto my-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              {i18n.underDevTitle}
            </h2>
            <p className="text-gray-600">
              {i18n.underDevSub}
            </p>
          </div>
        )}



        {/* WALLET HISTORY VIEW */}
        {currentView === "wallet-history" && (
          <div className="bg-white min-h-[500px] text-gray-900 rounded-lg overflow-hidden shadow-sm border border-gray-100">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border-b border-gray-100 bg-gray-50/50">
              <h2 className="text-xl font-bold mb-4 sm:mb-0 flex items-center gap-2">
                <Wallet className="w-5 h-5 text-gray-500" /> Top-up & Withdraw
                History
              </h2>
              <button
                onClick={() => setCurrentView("profile")}
                className="text-sm font-medium text-[#2AABEE] hover:underline bg-[#2AABEE]/10 px-3 py-1.5 rounded-lg border border-[#2AABEE]/20"
              >
                Back to Profile
              </button>
            </div>

            {/* List */}
            <div className="divide-y divide-gray-100">
              {transactions.filter(
                (t) =>
                  t.type === "withdraw" ||
                  t.type === "deposit" ||
                  t.type === "topup" ||
                  t.type === "referral_bonus",
              ).length === 0 ? (
                <div className="p-8 text-center text-gray-500 italic">
                  No wallet history found.
                </div>
              ) : (
                transactions
                  .filter(
                    (t) =>
                      t.type === "withdraw" ||
                      t.type === "deposit" ||
                      t.type === "topup" ||
                      t.type === "referral_bonus",
                  )
                  .map((tx) => (
                    <div
                      key={tx.id}
                      className="p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-3 rounded-full ${tx.type === "withdraw" ? "bg-red-50 text-red-500" : "bg-green-50 text-green-500"}`}
                        >
                          {tx.type === "withdraw" ? (
                            <ArrowRight className="w-5 h-5 transform -rotate-45" />
                          ) : (
                            <Wallet className="w-5 h-5" />
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-gray-800 capitalize">
                            {tx.type === "withdraw"
                              ? "Withdraw"
                              : tx.type === "referral_bonus"
                                ? "Referral Bonus"
                                : "Top-up"}
                            {tx.status === "OK" || tx.status === "paid" ? (
                              <span className="text-green-500 ml-1 text-sm">
                                ✓
                              </span>
                            ) : (
                              <span className="text-yellow-500 ml-1 text-sm font-normal">
                                (Pending)
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(tx.createdAt).toLocaleString()}{" "}
                            {tx.details?.method ? `• ${tx.details.method}` : ""}
                          </p>
                          {tx.details?.account && (
                            <p className="text-xs font-mono text-gray-400 mt-1">
                              Account: {tx.details.account}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-left sm:text-right">
                        <p
                          className={`font-bold text-lg ${tx.type === "withdraw" ? "text-red-500" : "text-green-600"}`}
                        >
                          {tx.type === "withdraw" ? "-" : "+"}$
                          {tx.amountUSD?.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        )}

        {/* RECORDS VIEW */}
        {currentView === "records" && (
          <div className="bg-[#121218] min-h-[500px] text-white rounded-lg overflow-hidden shadow-2xl">
            {/* Header / Tabs */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border-b border-gray-800">
              <h2 className="text-xl font-bold mb-4 sm:mb-0">
                {i18n.recordsTitle || "Transaction Ledger"}
              </h2>
              <div className="flex items-center gap-2">
                <button className="text-[#2AABEE] border-b-2 border-[#2AABEE] px-4 py-2 font-bold">
                  {i18n.buyTab || "BUY"}
                </button>
                <button className="text-gray-500 hover:text-gray-300 px-4 py-2 font-bold cursor-not-allowed">
                  {i18n.sellTab || "SELL"}
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="text-gray-500 tracking-wider text-xs uppercase border-b border-gray-800">
                  <tr>
                    <th className="px-6 py-4">{i18n.colPhone || "PHONE"}</th>
                    <th className="px-6 py-4">{i18n.colPrice || "PRICE"}</th>
                    <th className="px-6 py-4">{i18n.colDate || "DATE"}</th>
                    <th className="px-6 py-4">{i18n.colStatus || "STATUS"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {transactions
                    .filter((t) => t.type === "purchase")
                    .map((tx) => (
                      <tr
                        key={tx.id}
                        className="hover:bg-white/5 transition-colors"
                      >
                        <td className="px-6 py-4 font-mono font-bold text-gray-200">
                          {tx.details?.phone || "Loading..."}
                        </td>
                        <td className="px-6 py-4 text-gray-400">
                          {tx.amountUSD?.toFixed(2)} USD
                        </td>
                        <td className="px-6 py-4 text-gray-500">
                          {new Date(tx.createdAt).toLocaleString(undefined, {
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true,
                          })}
                        </td>
                        <td className="px-6 py-4">
                          {tx.status === "WAIT" ? (
                            <div className="flex items-center gap-4">
                              <span className="text-yellow-500 font-bold uppercase">
                                WAIT
                              </span>
                              <button
                                onClick={() =>
                                  handleGetCode(tx.details?.phone, tx.id)
                                }
                                className="bg-[#2AABEE]/10 text-[#2AABEE] border border-[#2AABEE]/30 hover:bg-[#2AABEE]/20 px-3 py-1.5 rounded-lg text-xs transition font-bold shadow-sm"
                              >
                                {i18n.getCodeBtnRecord || "Get Code"}
                              </button>
                            </div>
                          ) : tx.status === "OK" ? (
                            <div className="flex flex-col gap-1 items-start">
                              <span className="text-green-500 font-bold uppercase">
                                OK
                              </span>
                              {tx.details?.code && (
                                <span className="font-mono text-xs bg-green-500/10 text-green-400 px-2 py-0.5 rounded inline-block shadow-sm">
                                  Code: {tx.details.code}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-red-500 font-bold">
                              {tx.status}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  {transactions.filter((t) => t.type === "purchase").length ===
                    0 && (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-6 py-8 text-center text-gray-500 italic"
                      >
                        No transactions found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* PROFILE VIEW */}
        {currentView === "profile" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b pb-4">
              <h2 className="text-2xl font-bold text-gray-800">
                {i18n.profileTitle || "My Profile"}
              </h2>
              <button
                onClick={() => signOut(auth)}
                className="flex items-center gap-2 bg-red-100 text-red-600 hover:bg-red-200 px-4 py-2 rounded-lg text-sm font-bold transition"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Account Card */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-3xl font-bold text-blue-600">
                    {currentUser?.email
                      ? currentUser.email[0].toUpperCase()
                      : "U"}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {currentUser?.email || "User"}
                    </h3>
                    <p className="text-gray-500 font-mono text-sm">
                      UID: {numericId}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b border-gray-50">
                    <span className="text-gray-600">Total Balance</span>
                    <span className="font-bold text-gray-900">
                      ${balanceUSD.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-gray-50">
                    <span className="text-gray-600">Account Status</span>
                    <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-bold uppercase">
                      Active
                    </span>
                  </div>
                </div>
              </div>

              {/* Referral Profile Card */}
              <div className="bg-gradient-to-r from-orange-400 to-amber-500 p-6 rounded-2xl shadow-lg text-white overflow-hidden relative">
                <div className="relative z-10">
                  <h3 className="text-2xl font-bold mb-2">
                    {i18n.referEarnUpTo || "Refer & Earn"}
                  </h3>
                  <p className="text-orange-50 text-sm md:text-base mb-6 leading-relaxed">
                    {i18n.referDesc ||
                      "Earn 1% lifetime commission on every deposit."}
                  </p>

                  <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 mb-4">
                    <p className="text-xs text-orange-100 uppercase tracking-wider font-bold mb-2">
                      {i18n.yourRefLink || "Your Link"}
                    </p>
                    <div className="flex items-center gap-2">
                      <code className="bg-black/20 px-3 py-2 rounded-lg font-mono text-sm flex-1 overflow-x-auto whitespace-nowrap">
                        {window.location.origin}/?ref={currentUser?.uid}
                      </code>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(
                            `${window.location.origin}/?ref=${currentUser?.uid}`,
                          );
                          alert("Copied!");
                        }}
                        className="bg-white text-orange-600 px-4 py-2 rounded-lg text-sm font-bold hover:bg-orange-50 transition"
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                </div>
                <div className="absolute right-[-10%] top-[-20%] w-64 h-64 bg-white/10 rounded-full blur-3xl outline-none"></div>
              </div>
            </div>

            {/* Referrals List */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-4 border-b border-gray-50 bg-gray-50/50 flex items-center justify-between">
                <h3 className="font-bold text-gray-800">My Invited Users</h3>
                <span className="bg-orange-100 text-orange-700 font-bold px-2 py-0.5 rounded text-xs">
                  {referredUsers.length} Users
                </span>
              </div>

              {referredUsers.length === 0 ? (
                <div className="p-8 text-center">
                  <UserPlus className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">
                    You haven't invited anyone yet.
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    Share your link above to get started!
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {referredUsers.map((user) => (
                    <div
                      key={user.id}
                      className="p-4 flex items-center justify-between hover:bg-gray-50 transition"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center font-bold text-gray-600 border border-gray-300">
                          {user.name ? user.name[0].toUpperCase() : "U"}
                        </div>
                        <div>
                          <p className="font-bold text-gray-800">
                            {user.name || "Anonymous User"}
                          </p>
                          <p className="text-xs text-gray-500">
                            Joined:{" "}
                            {new Date(user.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div>
                        {user.hasDeposited || user.balanceUSD > 0 ? (
                          <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold uppercase border border-green-200">
                            Active
                          </span>
                        ) : (
                          <span className="bg-gray-100 text-gray-500 px-2 py-1 rounded text-xs font-bold uppercase border border-gray-200">
                            Unactive
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Actions / Settings */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-4 border-b border-gray-50 bg-gray-50/50">
                <h3 className="font-bold text-gray-800">Account Actions</h3>
              </div>
              <div className="divide-y divide-gray-50">
                <button
                  onClick={() => setCurrentView("wallet-history")}
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                      <Wallet className="w-5 h-5" />
                    </div>
                    <span className="font-medium text-gray-700">
                      Top-up & Withdraw History
                    </span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                </button>
                <button
                  onClick={() => setCurrentView("records")}
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                      <FileText className="w-5 h-5" />
                    </div>
                    <span className="font-medium text-gray-700">
                      Buy & Sell Records
                    </span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                </button>
                <button
                  onClick={() => {
                    requestNotificationPermission();
                    alert("Notifications Enabled");
                  }}
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <span className="font-medium text-gray-700">
                      Enable Push Notifications
                    </span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            </div>

            {/* Recent Transactions in Profile */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-gray-50 bg-gray-50/50">
                <h3 className="font-bold text-gray-800">
                  Recent Wallet History
                </h3>
                <button
                  onClick={() => setCurrentView("wallet-history")}
                  className="text-sm font-medium text-[#2AABEE] hover:underline"
                >
                  View All
                </button>
              </div>
              <div className="divide-y divide-gray-50">
                {transactions
                  .filter(
                    (t) =>
                      t.type === "withdraw" ||
                      t.type === "deposit" ||
                      t.type === "topup" ||
                      t.type === "referral_bonus",
                  )
                  .slice(0, 5)
                  .map((tx) => (
                    <div
                      key={tx.id}
                      className="p-4 flex items-center justify-between hover:bg-gray-50 transition"
                    >
                      <div>
                        <p className="font-bold text-gray-800 capitalize">
                          {tx.type === "withdraw"
                            ? "Withdraw"
                            : tx.type === "referral_bonus"
                              ? "Referral Bonus"
                              : "Top-up"}
                          {tx.status === "OK" || tx.status === "paid" ? (
                            <span className="text-green-500 ml-1">✓</span>
                          ) : (
                            <span className="text-yellow-500 ml-1 text-xs">
                              Pending
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(tx.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p
                          className={`font-bold ${tx.type === "withdraw" ? "text-red-500" : "text-green-600"}`}
                        >
                          {tx.type === "withdraw" ? "-" : "+"}$
                          {tx.amountUSD?.toFixed(2)}
                        </p>
                        <p className="text-xs font-mono text-gray-400 max-w-[120px] truncate">
                          {tx.details?.method || tx.details?.account || ""}
                        </p>
                      </div>
                    </div>
                  ))}
                {transactions.filter(
                  (t) =>
                    t.type === "withdraw" ||
                    t.type === "deposit" ||
                    t.type === "topup" ||
                    t.type === "referral_bonus",
                ).length === 0 && (
                  <div className="p-6 text-center text-gray-500 italic">
                    No recent transactions
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* DASHBOARD VIEW */}
        {currentView === "dashboard" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b pb-4">
              <h2 className="text-2xl font-bold text-gray-800">
                {i18n.dashboardTitle}
              </h2>
              {numericId && (
                <div className="bg-gray-100 text-gray-800 px-3 py-1.5 rounded-lg text-sm font-bold font-mono border border-gray-200 flex items-center shadow-sm">
                  My UID: {numericId}
                </div>
              )}
            </div>

            {/* Quick Actions (Buy / Sell / Topup / Withdraw inside dashboard) */}
            <div className="grid grid-cols-2 gap-4 mb-6 md:grid-cols-4">
              <div
                onClick={() => setCurrentView("buy")}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer hover:shadow-md transition flex flex-col"
              >
                <div className="relative bg-gradient-to-br from-blue-500 to-blue-600 h-28 flex flex-col items-center justify-center px-4 pt-4 pb-2">
                  <div className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    Hot
                  </div>
                  <svg
                    className="w-12 h-12 text-white"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.19-.08-.05-.19-.02-.27 0-.11.03-1.93 1.23-5.45 3.61-.51.35-.98.53-1.4.52-.46-.01-1.34-.26-1.99-.48-.8-.27-1.42-.42-1.37-.89.03-.25.38-.51 1.04-.78 4.08-1.78 6.79-2.95 8.12-3.5 3.86-1.6 4.66-1.88 5.18-1.89.11 0 .36.03.49.14.11.09.15.22.16.34-.01.07.01.21-.01.4z" />
                  </svg>
                  <div className="text-white font-bold text-lg leading-tight tracking-tight mt-1">TELEGRAM</div>
                </div>
                <div className="p-3 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1 text-sm sm:text-base leading-tight">
                      Buy Telegram Account
                    </h3>
                    <div className="flex items-center gap-0.5 mb-2">
                      <span className="text-amber-400 text-xs sm:text-sm">★</span>
                      <span className="text-amber-400 text-xs sm:text-sm">★</span>
                      <span className="text-amber-400 text-xs sm:text-sm">★</span>
                      <span className="text-amber-400 text-xs sm:text-sm">★</span>
                      <span className="text-amber-400 text-xs sm:text-sm">★</span>
                    </div>
                  </div>
                  <div className="flex items-center text-xs text-gray-500 gap-1.5 mt-auto">
                    <Heart className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">130+ country available</span>
                  </div>
                </div>
              </div>

              <div
                onClick={() => setCurrentView("sell")}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer hover:shadow-md transition flex flex-col"
              >
                <div className="relative bg-gradient-to-br from-purple-500 to-purple-600 h-28 flex flex-col items-center justify-center px-4 pt-4 pb-2">
                  <div className="absolute top-2 left-2 bg-yellow-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    Maintenance
                  </div>
                  <svg
                    className="w-12 h-12 text-white"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.19-.08-.05-.19-.02-.27 0-.11.03-1.93 1.23-5.45 3.61-.51.35-.98.53-1.4.52-.46-.01-1.34-.26-1.99-.48-.8-.27-1.42-.42-1.37-.89.03-.25.38-.51 1.04-.78 4.08-1.78 6.79-2.95 8.12-3.5 3.86-1.6 4.66-1.88 5.18-1.89.11 0 .36.03.49.14.11.09.15.22.16.34-.01.07.01.21-.01.4z" />
                  </svg>
                  <div className="text-white font-bold text-lg leading-tight tracking-tight mt-1">TELEGRAM</div>
                </div>
                <div className="p-3 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1 text-sm sm:text-base leading-tight">
                      Sell Telegram Account
                    </h3>
                    <div className="flex items-center text-xs text-red-500 font-bold mb-2">
                      Under Maintenance
                    </div>
                  </div>
                  <div className="flex items-center text-xs text-gray-400 gap-1.5 mt-auto">
                    <Heart className="w-3.5 h-3.5 shrink-0" />
                    <span>Coming soon</span>
                  </div>
                </div>
              </div>

              <div
                onClick={() => setTopupModal(true)}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer hover:shadow-md transition flex flex-col"
              >
                <div className="relative bg-gradient-to-br from-green-500 to-green-600 h-28 flex flex-col items-center justify-center p-4">
                  <Wallet className="w-12 h-12 text-white opacity-90 mb-1" />
                  <div className="text-white font-bold text-lg leading-tight tracking-tight">FUNDS</div>
                </div>
                <div className="p-3 flex-1 flex flex-col justify-center text-center">
                  <h3 className="font-bold text-gray-900 mb-0.5 text-sm sm:text-base leading-tight">
                    {i18n.topupBtn}
                  </h3>
                  <div className="text-xs text-gray-500">
                    Add money to wallet
                  </div>
                </div>
              </div>

              <div
                onClick={() => setWithdrawModal(true)}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer hover:shadow-md transition flex flex-col"
              >
                <div className="relative bg-gradient-to-br from-amber-500 to-amber-600 h-28 flex flex-col items-center justify-center p-4">
                  <ArrowRight className="w-12 h-12 text-white transform -rotate-45 opacity-90 mb-1" />
                  <div className="text-white font-bold text-lg leading-tight tracking-tight">CASH OUT</div>
                </div>
                <div className="p-3 flex-1 flex flex-col justify-center text-center">
                  <h3 className="font-bold text-gray-900 mb-0.5 text-sm sm:text-base leading-tight">
                    {i18n.withdrawBtn}
                  </h3>
                  <div className="text-xs text-gray-500">
                    Withdraw earnings
                  </div>
                </div>
              </div>
            </div>

            {/* Invite & Earn Banner */}
            <div
              onClick={() => setCurrentView("profile")}
              className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl p-6 text-white cursor-pointer hover:shadow-xl transition transform hover:-translate-y-1 relative overflow-hidden group mb-6 mt-4 md:mt-0"
            >
              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold mb-1 flex items-center gap-2">
                    Invite & Earn
                  </h3>
                  <p className="text-orange-50 font-medium">
                    Refer friends and earn rewards when they top up.
                  </p>
                </div>
                <div className="bg-white/20 p-3 rounded-full group-hover:bg-white/30 transition shadow-inner">
                  <ArrowRight className="w-6 h-6" />
                </div>
              </div>
              <div className="absolute right-[-5%] top-[-50%] w-48 h-48 bg-white/10 rounded-full blur-3xl outline-none"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Balance Card */}
              <div className="bg-gradient-to-br from-[#2AABEE] to-blue-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                <div className="relative z-10">
                  <p className="text-blue-100 text-sm font-medium mb-1">
                    {i18n.availBal}
                  </p>
                  <h3 className="text-4xl font-bold tracking-tight">
                    ${balanceUSD.toFixed(2)}{" "}
                    <span className="text-xl font-normal text-blue-200">
                      USD
                    </span>
                  </h3>
                </div>
                <Wallet className="absolute right-[-20px] bottom-[-20px] w-32 h-32 text-blue-400 opacity-20" />
              </div>

              {/* Top-up Card */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-2">
                    {i18n.addFundsTitle}
                  </h3>
                  <p className="text-gray-500 text-sm mb-4">
                    {i18n.addFundsSub}
                  </p>
                  <div className="bg-blue-50 text-blue-700 text-sm font-medium px-3 py-1.5 rounded-lg inline-block mb-1">
                    {i18n.rateLbl} {TOPUP_RATE} BDT
                  </div>
                  <p className="text-xs text-gray-500 mb-4">
                    Crypto & Binance: 1 USD = 1 USD
                  </p>
                </div>
                <button
                  onClick={() => setTopupModal(true)}
                  className="w-full bg-[#2AABEE] text-white py-2.5 rounded-lg font-medium hover:bg-blue-500 transition shadow-sm"
                >
                  {i18n.topupBtn}
                </button>
              </div>

              {/* Withdraw Card */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-2">
                    {i18n.withdrawFundsTitle}
                  </h3>
                  <p className="text-gray-500 text-sm mb-4">
                    {i18n.withdrawFundsSub}
                  </p>
                  <div className="bg-green-50 text-green-700 text-sm font-medium px-3 py-1.5 rounded-lg inline-block mb-1">
                    {i18n.rateLbl} {WITHDRAW_RATE} BDT
                  </div>
                  <p className="text-xs text-gray-500 mb-4">
                    BSC-USDT / Binance: 1 USD = 1 USD
                  </p>
                </div>
                <button
                  onClick={() => setWithdrawModal(true)}
                  className="w-full bg-slate-800 text-white py-2.5 rounded-lg font-medium hover:bg-slate-700 transition shadow-sm"
                >
                  {i18n.withdrawBtn}
                </button>
              </div>
            </div>

            {/* Why Choose Us / Value Proposition */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="bg-white p-5 rounded-xl border border-gray-100 text-center shadow-sm hover:shadow-md hover:border-blue-200 transition-all group">
                <div className="bg-blue-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-blue-500 transition-colors">
                  <Timer className="w-6 h-6 text-blue-500 group-hover:text-white transition-colors" />
                </div>
                <h4 className="font-bold text-gray-800 mb-1 text-sm">
                  Instant Processing
                </h4>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Transactions are handled automatically in real-time, 24/7.
                </p>
              </div>
              <div className="bg-white p-5 rounded-xl border border-gray-100 text-center shadow-sm hover:shadow-md hover:border-purple-200 transition-all group">
                <div className="bg-purple-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-purple-500 transition-colors">
                  <ShieldCheck className="w-6 h-6 text-purple-500 group-hover:text-white transition-colors" />
                </div>
                <h4 className="font-bold text-gray-800 mb-1 text-sm">
                  Secure Vault
                </h4>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Your funds are protected with multiple layers of enterprise
                  security.
                </p>
              </div>
              <div className="bg-white p-5 rounded-xl border border-gray-100 text-center shadow-sm hover:shadow-md hover:border-emerald-200 transition-all group">
                <div className="bg-emerald-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-emerald-500 transition-colors">
                  <Headphones className="w-6 h-6 text-emerald-500 group-hover:text-white transition-colors" />
                </div>
                <h4 className="font-bold text-gray-800 mb-1 text-sm">
                  Always Here
                </h4>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Dedicated support via Telegram or Help Desk whenever needed.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ADMIN VIEW */}
        {currentView === "admin" && (
          <div className="space-y-6">
            <div className="bg-red-50 p-4 sm:p-6 rounded-xl border border-red-100 text-red-900 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Settings className="w-6 h-6" />
                  {i18n.adminPanelTitle}
                </h2>
                <p className="opacity-80">{i18n.adminPanelSub}</p>
              </div>
              <button
                onClick={async () => {
                  try {
                    const mockAccounts = [
                      {
                        title: "Crypto Traders Pro",
                        type: "Channel",
                        subscribers: 15400,
                        ageDays: 340,
                        priceUSD: 150,
                        verified: true,
                        topic: "Finance",
                      },
                      {
                        title: "Local Marketplace",
                        type: "Group",
                        subscribers: 5200,
                        ageDays: 120,
                        priceUSD: 45,
                        verified: false,
                        topic: "Trading",
                      },
                      {
                        title: "Tech News Daily",
                        type: "Channel",
                        subscribers: 45000,
                        ageDays: 850,
                        priceUSD: 400,
                        verified: true,
                        topic: "Technology",
                      },
                      {
                        title: "Gaming Community",
                        type: "Group",
                        subscribers: 1250,
                        ageDays: 60,
                        priceUSD: 20,
                        verified: false,
                        topic: "Gaming",
                      },
                      {
                        title: "Airdrop Hunters",
                        type: "Channel",
                        subscribers: 25000,
                        ageDays: 400,
                        priceUSD: 250,
                        verified: true,
                        topic: "Crypto",
                      },
                    ];
                    for (const acc of mockAccounts) {
                      const accRef = doc(collection(db, "accounts"));
                      await setDoc(accRef, {
                        ...acc,
                        ownerId: currentUser!.uid,
                        createdAt: Date.now(),
                      });
                    }
                    alert("Seeded mock accounts!");
                  } catch (e) {
                    console.error(e);
                    alert("Error seeding accounts.");
                  }
                }}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition"
              >
                Seed Mock Accounts
              </button>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Globe className="w-5 h-5 text-indigo-500" /> Advertisement Banner
              </h3>
              <div className="flex flex-col gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Upload Banner Image (Max 500KB)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        if (file.size > 500000) {
                          alert("Image is too large. Please upload an image smaller than 500KB.");
                          return;
                        }
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setAdminBannerSettings({...adminBannerSettings, imageUrl: reader.result as string});
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#2AABEE] bg-gray-50 text-sm"
                  />
                  {adminBannerSettings.imageUrl && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-500 mb-2">Image Preview:</p>
                      <img src={adminBannerSettings.imageUrl} alt="Banner Preview" className="max-h-32 rounded-lg border border-gray-200 object-cover" />
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Target Link URL</label>
                  <input
                    type="text"
                    placeholder="https://example.com/promotion"
                    value={adminBannerSettings.linkUrl}
                    onChange={(e) => setAdminBannerSettings({...adminBannerSettings, linkUrl: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#2AABEE]"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="bannerActive"
                    checked={adminBannerSettings.isActive}
                    onChange={(e) => setAdminBannerSettings({...adminBannerSettings, isActive: e.target.checked})}
                    className="w-4 h-4 text-[#2AABEE] rounded focus:ring-[#2AABEE]"
                  />
                  <label htmlFor="bannerActive" className="text-sm font-medium text-gray-700 cursor-pointer">
                    Enable Banner
                  </label>
                </div>
                <button
                  disabled={isPublishingBanner}
                  onClick={async () => {
                    setIsPublishingBanner(true);
                    try {
                      await setDoc(doc(db, "settings", "banner"), adminBannerSettings);
                      alert("Banner settings updated successfully! It is now live.");
                    } catch (e: any) {
                      alert("Error updating banner: " + e.message);
                    } finally {
                      setIsPublishingBanner(false);
                    }
                  }}
                  className={`w-full md:w-auto self-start bg-indigo-500 text-white px-6 py-2 rounded-lg font-bold transition shadow-sm ${isPublishingBanner ? "opacity-70 cursor-not-allowed" : "hover:bg-indigo-600"}`}
                >
                  {isPublishingBanner ? "Publishing..." : "Publish Banner"}
                </button>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Wallet className="w-5 h-5 text-[#2AABEE]" /> Add Balance to
                User
              </h3>
              <div className="flex flex-col md:flex-row gap-4">
                <input
                  type="text"
                  placeholder="User ID (UID)"
                  value={adminAddBalanceUid}
                  onChange={(e) => setAdminAddBalanceUid(e.target.value)}
                  className="w-full md:w-1/2 p-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#2AABEE]"
                />
                <input
                  type="number"
                  placeholder="Amount (USD)"
                  value={adminAddBalanceAmount}
                  onChange={(e) =>
                    setAdminAddBalanceAmount(
                      e.target.value === "" ? "" : Number(e.target.value),
                    )
                  }
                  className="w-full md:w-1/4 p-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#2AABEE]"
                />
                <button
                  onClick={handleAdminAddBalance}
                  className="w-full md:w-1/4 bg-[#2AABEE] text-white py-2 rounded-lg font-bold hover:bg-blue-500 transition shadow-sm"
                >
                  Add Balance
                </button>
              </div>
            </div>

            {/* Active Users Analytics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 text-center">
                <div className="text-sm text-gray-500 font-medium mb-1">
                  Live Users
                </div>
                <div className="text-3xl font-bold text-green-600 flex items-center justify-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  {activeUsersStats.live}
                </div>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 text-center">
                <div className="text-sm text-gray-500 font-medium mb-1">
                  Daily Active
                </div>
                <div className="text-2xl font-bold text-gray-800">
                  {activeUsersStats.daily}
                </div>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 text-center">
                <div className="text-sm text-gray-500 font-medium mb-1">
                  Weekly Active
                </div>
                <div className="text-2xl font-bold text-gray-800">
                  {activeUsersStats.weekly}
                </div>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 text-center">
                <div className="text-sm text-gray-500 font-medium mb-1">
                  Monthly Active
                </div>
                <div className="text-2xl font-bold text-gray-800">
                  {activeUsersStats.monthly}
                </div>
              </div>
            </div>

            {/* Pending Withdrawals Management */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                <h3 className="font-bold text-gray-800">Pending Withdrawals</h3>
              </div>
              <div className="divide-y divide-gray-100">
                {adminWithdrawals.filter((tx) => tx.status === "pending")
                  .length === 0 ? (
                  <div className="p-4 text-center text-gray-500 italic">
                    No pending withdrawals
                  </div>
                ) : (
                  adminWithdrawals
                    .filter((tx) => tx.status === "pending")
                    .map((adminTx) => (
                      <div
                        key={adminTx.id}
                        className="p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4 hover:bg-gray-50 transition-colors"
                      >
                        <div>
                          <p className="font-bold text-gray-900">
                            Req: ${adminTx.amountUSD.toFixed(2)} USD
                            <span className="text-sm font-bold text-green-600 ml-2">
                              Payout:{" "}
                              {adminTx.details?.method === "Binance" ||
                              adminTx.details?.method === "BSC-USDT" ||
                              adminTx.details?.method === "crypto"
                                ? `$${(adminTx.details?.payoutUsd || adminTx.amountUSD).toFixed(2)}`
                                : `${(adminTx.details?.payoutBdt || adminTx.amountUSD * WITHDRAW_RATE).toLocaleString()} BDT`}
                            </span>
                          </p>
                          {adminTx.details && (
                            <div className="flex gap-2 items-center mt-1">
                              <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-xs font-bold uppercase">
                                {adminTx.details.method}
                              </span>
                              <span className="text-sm font-mono text-gray-700 bg-gray-100 px-2 py-0.5 rounded border border-gray-200 select-all">
                                {adminTx.details.account}
                              </span>
                            </div>
                          )}
                          <div className="flex flex-wrap gap-2 items-center mt-3">
                            <span className="font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded text-xs">
                              {adminTx.userNumericId
                                ? `UID: ${adminTx.userNumericId}`
                                : "UID: N/A"}
                            </span>
                            <span className="text-xs font-medium text-gray-500">
                              {adminTx.userEmail ||
                                adminTx.userId.slice(0, 8) + "..."}
                            </span>
                            <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded text-xs font-bold leading-none flex items-center gap-1 border border-orange-200">
                              <Timer className="w-3 h-3" />
                              Wait: {getTimeElapsedString(adminTx.createdAt)}
                            </span>
                          </div>
                        </div>
                        <div>
                          <button
                            onClick={async () => {
                              await updateDoc(
                                doc(db, "transactions", adminTx.id),
                                { status: "paid" },
                              );
                              alert("Marked as paid");
                            }}
                            className="bg-green-500 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-green-600 transition shadow-sm"
                          >
                            Mark as Paid
                          </button>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>

            {/* Paid Withdrawals History */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <h3 className="font-bold text-gray-800">
                  Paid Withdrawals History
                </h3>
              </div>
              <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
                {adminWithdrawals.filter((tx) => tx.status === "paid")
                  .length === 0 ? (
                  <div className="p-4 text-center text-gray-500 italic">
                    No paid withdrawals
                  </div>
                ) : (
                  adminWithdrawals
                    .filter((tx) => tx.status === "paid")
                    .map((adminTx) => (
                      <div
                        key={adminTx.id}
                        className="p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4"
                      >
                        <div>
                          <p className="font-bold text-gray-900">
                            Req: ${adminTx.amountUSD.toFixed(2)} USD
                            <span className="text-sm font-bold text-green-600 ml-2">
                              Payout:{" "}
                              {adminTx.details?.method === "Binance" ||
                              adminTx.details?.method === "BSC-USDT" ||
                              adminTx.details?.method === "crypto"
                                ? `$${(adminTx.details?.payoutUsd || adminTx.amountUSD).toFixed(2)}`
                                : `${(adminTx.details?.payoutBdt || adminTx.amountUSD * WITHDRAW_RATE).toLocaleString()} BDT`}
                            </span>
                          </p>
                          {adminTx.details && (
                            <div className="flex gap-2 items-center mt-1">
                              <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-xs font-bold uppercase">
                                {adminTx.details.method}
                              </span>
                              <span className="text-sm font-mono text-gray-700 bg-gray-100 px-2 py-0.5 rounded border border-gray-200 select-all">
                                {adminTx.details.account}
                              </span>
                            </div>
                          )}
                          <div className="flex flex-wrap gap-2 items-center mt-3">
                            <span className="font-bold text-gray-600 bg-gray-200 px-2 py-0.5 rounded text-xs">
                              {adminTx.userNumericId
                                ? `UID: ${adminTx.userNumericId}`
                                : "UID: N/A"}
                            </span>
                            <span className="text-xs font-medium text-gray-500">
                              {adminTx.userEmail ||
                                adminTx.userId.slice(0, 8) + "..."}
                            </span>
                            <span className="text-xs text-gray-400">
                              Created:{" "}
                              {new Date(adminTx.createdAt).toLocaleString()}
                            </span>
                          </div>
                        </div>
                        <div>
                          <span className="text-sm font-bold text-green-600 bg-green-50 px-3 py-1.5 rounded-lg border border-green-200">
                            Paid
                          </span>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                {i18n.markupTitle}
              </h3>
              <div className="flex items-end gap-4 max-w-sm">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {i18n.markupLbl}
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={markupPercent}
                    onChange={(e) => setMarkupPercent(Number(e.target.value))}
                    className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-red-400"
                  />
                </div>
                <button className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition">
                  {i18n.saveBtn}
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-2">{i18n.markupHelp}</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <h3 className="font-bold text-gray-800">
                  {i18n.botStatusTitle}
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-white border-b">
                    <tr>
                      <th className="px-4 py-3 font-medium text-gray-600">
                        {i18n.colCountry}
                      </th>
                      <th className="px-4 py-3 font-medium text-gray-600">
                        {i18n.colCode}
                      </th>
                      <th className="px-4 py-3 font-medium text-gray-600">
                        {i18n.colStock}
                      </th>
                      <th className="px-4 py-3 font-medium text-gray-600">
                        {i18n.colBase}
                      </th>
                      <th className="px-4 py-3 font-medium text-red-600 font-bold">
                        {i18n.colWeb} (+{markupPercent}%)
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {countries.map((c) => (
                      <tr key={c.id} className="hover:bg-gray-50 transition">
                        <td className="px-4 py-3 font-medium text-gray-900">
                          {c.flag || getFlag(c.country, c.code)} {c.country}
                        </td>
                        <td className="px-4 py-3 text-gray-500">{c.code}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${c.stock > 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                          >
                            {c.stock}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          ${c.basePrice.toFixed(2)}
                        </td>
                        <td className="px-4 py-3 font-bold text-gray-900">
                          $
                          {(
                            c.basePrice +
                            (c.basePrice * markupPercent) / 100
                          ).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                {i18n.autoSellTitle}
              </h3>
              <p className="text-gray-600 mb-4">{i18n.autoSellSub}</p>
              <div className="bg-gray-100 p-4 rounded-lg font-mono text-sm text-gray-500 border border-gray-200">
                status: offline
                <br />
                endpoint: /api/seller/sync
                <br />
                connected_nodes: 0
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      {p2pModal && renderP2pModal()}
      {topupModal && renderTopupModal()}
      {withdrawModal && renderWithdrawModal()}
      {purchasedNumber && renderPurchasedModal()}
    </div>
  );
}
