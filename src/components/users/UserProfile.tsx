"use client";

import React from "react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { User } from "../../types/user";
import { useParams } from "next/navigation";
import { getJwtFromLocalStorage } from "@/utils/localStorage";
import API from "@/utils/API";
import UserAvatar from "@/components/common/UserAvatar";

const headers = {
  Authorization: `JWT ${getJwtFromLocalStorage()}`,
  "Content-Type": "application/json",
};

function UserProfile() {
  const { id } = useParams();
  const [User, setUser] = useState<User | undefined>();
  const [loading, setloading] = useState(false);
  const [refrech, setrefrech] = useState(false);
  const [isVipToggling, setIsVipToggling] = useState(false);
  const [showExchangeModal, setShowExchangeModal] = useState(false);
  const [exchangeAmount, setExchangeAmount] = useState<number | ''>('');
  const [pointsPerDollar, setPointsPerDollar] = useState<number>(100);
  const [showBalanceModal, setShowBalanceModal] = useState(false);
  const [balanceTarget, setBalanceTarget] = useState<'dollars' | 'coins'>('dollars');
  const [balanceOperation, setBalanceOperation] = useState<'add' | 'set' | 'deduct'>('add');
  const [balanceAmount, setBalanceAmount] = useState<number | ''>('');

  async function handleUpdateBalance() {
    if (balanceAmount === '' || isNaN(Number(balanceAmount)) || Number(balanceAmount) < 0) {
      toast.error('يرجى إدخال مبلغ صحيح');
      return;
    }

    try {
      setloading(true);
      const res = await API.put(
        `/api/v3/users/firestore/addbalance/${User?.id}`,
        {
          amount: Number(balanceAmount),
          type: balanceTarget,
          operation: balanceOperation
        },
        { headers }
      );
      if (res.status === 200) {
        toast.success(res.data.message || 'تم تحديث الرصيد بنجاح');
        setShowBalanceModal(false);
        setBalanceAmount('');
        setrefrech(!refrech);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'فشل تحديث الرصيد');
    } finally {
      setloading(false);
    }
  }

  async function fetchSettingsRate() {
    try {
      const res = await API.get('/api/v3/settings', { headers });
      if (res.data?.pointsPerDollar) {
        setPointsPerDollar(res.data.pointsPerDollar);
      }
    } catch (e) {
      console.warn("Could not fetch settings rate", e);
    }
  }

  async function getUser() {
    try {
      const res = await API.get(`/api/v3/users/firestore/${id}`, { headers });

      if (res.status === 200) {
        setUser(res.data);
      } else {
        console.error("No user found");
        toast.error("No user found");
      }
    } catch (error) {
      console.error("Failed to fetch user", error);
      toast.error("Failed to fetch user");
    }
  }

  useEffect(() => {
    getUser();
    fetchSettingsRate();
  }, [refrech]);

  async function handleExchangeDollars() {
    try {
      setloading(true);
      const res = await API.post(
        `/api/v3/users/exchange-dollars/${User?.id}`,
        { amount: exchangeAmount === '' ? 'all' : Number(exchangeAmount) },
        { headers }
      );
      if (res.status === 200) {
        toast.success(res.data.message || 'Dollars exchanged successfully');
        setShowExchangeModal(false);
        setExchangeAmount('');
        setrefrech(!refrech);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to exchange dollars');
    } finally {
      setloading(false);
    }
  }

  const createdDate = User?.created
    ? new Date(
        User.created._seconds * 1000 +
          Math.floor(User.created._nanoseconds / 1000000),
      )
    : null;

  const LastSignin = User?.lastSignIn
    ? new Date(
        User.lastSignIn._seconds * 1000 +
          Math.floor(User.lastSignIn._nanoseconds / 1000000),
      )
    : null;



  async function toggleVipStatus(newStatus: boolean) {
    if (isVipToggling) return;
    
    try {
      setIsVipToggling(true);
      
      const res = await API.put(
        `/api/v3/users/firestore/updateVipStatus/${User?.id}`,
        { isVip: newStatus },
        { headers },
      );

      if (res.status === 200) {
        toast.success(`VIP status ${newStatus ? "enabled" : "disabled"}`);
        setrefrech(!refrech);
      }
    } catch (error) {
      console.error("Failed to update VIP status", error);
      toast.error("Failed to update VIP status");
    } finally {
      setIsVipToggling(false);
    }
  }



  const handleVipToggleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStatus = e.target.checked;
    toggleVipStatus(newStatus);
  };

  return (
    <div className="overflow-hidden rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
      <style jsx>{`
        .toggle-switch {
          position: relative;
          display: inline-block;
          width: 60px;
          height: 34px;
        }

        .toggle-switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }

        .slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: #ccc;
          transition: .4s;
          border-radius: 34px;
        }

        .slider:before {
          position: absolute;
          content: "";
          height: 26px;
          width: 26px;
          left: 4px;
          bottom: 4px;
          background-color: white;
          transition: .4s;
          border-radius: 50%;
        }

        input:checked + .slider {
          background-color: #3C50E0;
        }

        input:focus + .slider {
          box-shadow: 0 0 1px #3C50E0;
        }

        input:checked + .slider:before {
          transform: translateX(26px);
        }

        input:disabled + .slider {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
      
      <div className="relative z-20 h-35 md:h-65 bg-gradient-to-r from-slate-800 via-primary to-slate-900 rounded-tl-sm rounded-tr-sm overflow-hidden flex items-center justify-center">
        {User?.photo ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={User.photo}
            alt="profile cover"
            className="h-full w-full object-cover object-center opacity-80"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-blue-900/60 via-purple-900/40 to-slate-900/80 flex items-center justify-center text-white/30 text-2xl font-bold tracking-widest uppercase">
            {User?.name || "User Profile"}
          </div>
        )}
      </div>

      <div className="px-4 pb-6 text-center lg:pb-8 xl:pb-11.5">
        <div className="relative z-30 mx-auto -mt-22 h-30 w-full max-w-30 rounded-full bg-white/20 p-1 backdrop-blur sm:h-44 sm:max-w-44 sm:p-3">
          <div className="relative h-full w-full drop-shadow-2">
            <UserAvatar
              photo={User?.photo}
              name={User?.name}
              email={User?.email}
              sizeClasses="h-full w-full"
              textClasses="text-4xl sm:text-6xl font-bold"
            />
          </div>
        </div>
        <div className="mt-4">
          <h3 className="mb-1.5 text-2xl font-semibold text-black dark:text-white">
            {User?.name}
            {User?.isVip && (
              <span className="ml-2 inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">
                VIP 💎
              </span>
            )}
          </h3>

          <table className="mt-5 w-full table-auto">
            <thead>
              <tr className="bg-gray-2 text-left dark:bg-meta-4">
                <th className="min-w-[150px] px-4 py-4 text-center font-medium text-black dark:text-white">
                  Field
                </th>
                <th className="min-w-[150px] px-4 py-4 text-center font-medium text-black dark:text-white">
                  Value
                </th>
                <th className="px-4 py-4 text-center font-medium text-black dark:text-white">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td className="px-4 py-4 font-medium text-black dark:text-white">
                  Coins (رصيد النقاط)
                </td>
                <td className="px-4 py-4 text-black dark:text-white font-semibold">
                  <span className="text-blue-600 dark:text-blue-400 font-bold">{(User?.coins || 0).toLocaleString()} نقطة</span>
                </td>
                <td className="px-4 py-4">
                  <button
                    className="rounded bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-opacity-90 flex items-center gap-1 shadow-sm whitespace-nowrap"
                    onClick={() => {
                      setBalanceTarget('coins');
                      setBalanceOperation('add');
                      setBalanceAmount('');
                      setShowBalanceModal(true);
                    }}
                  >
                    <span>➕ تعديل / إضافة نقاط</span>
                  </button>
                </td>
              </tr>{" "}
              <tr>
                <td className="px-4 py-4 font-medium text-black dark:text-white">
                  UserID
                </td>
                <td className="truncate px-4 py-4 text-black dark:text-white">
                  {User?.id}
                </td>
                <td className="px-4 py-4"></td>
              </tr>
              <tr>
                <td className="px-4 py-4 font-medium text-black dark:text-white">
                  Balance (رصيد الدولارات)
                </td>
                <td className="px-4 py-4 text-black dark:text-white font-semibold">
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">{User?.dollars || 0} $</span>
                  {(User?.dollars || 0) > 0 && (
                    <span className="inline-block mr-2 px-2 py-0.5 text-xs rounded bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 font-normal">
                      (يعادل {((User?.dollars || 0) * pointsPerDollar).toLocaleString()} نقطة)
                    </span>
                  )}
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      className="rounded bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-opacity-90 flex items-center gap-1 shadow-sm whitespace-nowrap"
                      onClick={() => {
                        setBalanceTarget('dollars');
                        setBalanceOperation('add');
                        setBalanceAmount('');
                        setShowBalanceModal(true);
                      }}
                    >
                      <span>➕ إضافة دولارات ($)</span>
                    </button>
                    {(User?.dollars || 0) > 0 && (
                      <button
                        className="rounded bg-primary px-3 py-1.5 text-xs font-medium text-white hover:bg-opacity-90 shadow-sm whitespace-nowrap"
                        onClick={() => {
                          setExchangeAmount(User?.dollars || 0);
                          setShowExchangeModal(true);
                        }}
                      >
                        🔄 فك الدولارات إلى نقاط
                      </button>
                    )}
                  </div>
                </td>
              </tr>
              <tr>
                <td className="px-4 py-4 font-medium text-black dark:text-white">
                  نقاط المكافأة (Refill / Daily Reward)
                </td>
                <td className="px-4 py-4 text-black dark:text-white font-semibold">
                  {User?.dailyRewards ?? 50}
                </td>
                <td className="px-4 py-4 text-xs text-gray-500">
                  (موحدة لجميع المستخدمين من الإعدادات)
                </td>
              </tr>
              <tr>
                <td className="px-4 py-4 font-medium text-black dark:text-white">
                  VIP Status
                </td>
                <td className="px-4 py-4 text-black dark:text-white text-center">
                  <div>
                    {User?.isVip ? (
                      <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                        VIP
                      </span>
                    ) : (
                      <span className="bg-gray-100 text-gray-800 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium">
                        Not VIP
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-4 flex items-center justify-center">
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={User?.isVip || false}
                      onChange={handleVipToggleChange}
                      disabled={isVipToggling}
                    />
                    <span className="slider"></span>
                  </label>
                </td>
              </tr>
              <tr>
                <td className="px-4 py-4 font-medium text-black dark:text-white">
                  Email
                </td>
                <td className="px-4 py-4 text-black dark:text-white">
                  {User?.email}
                </td>
                <td className="px-4 py-4"></td>
              </tr>
              <tr>
                <td className="px-4 py-4 font-medium text-black dark:text-white">
                  Provider
                </td>
                <td className="px-4 py-4 text-black dark:text-white">
                  {User?.provider}
                </td>
                <td className="px-4 py-4"></td>
              </tr>
              <tr>
                <td className="px-4 py-4 font-medium text-black dark:text-white">
                  Created
                </td>
                <td className="px-4 py-4 text-black dark:text-white">
                  {createdDate ? createdDate.toLocaleString() : "N/A"}
                </td>
                <td className="px-4 py-4"></td>
              </tr>
              <tr>
                <td className="px-4 py-4 font-medium text-black dark:text-white">
                  Last Sign In
                </td>
                <td className="px-4 py-4 text-black dark:text-white">
                  {LastSignin ? LastSignin.toLocaleString() : "N/A"}
                </td>
                <td className="px-4 py-4"></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>


      {showExchangeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-700 bg-opacity-50">
          <div className="rounded-lg bg-white p-6 text-center shadow-lg dark:bg-boxdark max-w-sm w-full mx-4">
            <p className="mb-2 text-lg font-semibold text-black dark:text-white">
              🔄 فك الدولارات وتحويلها لنقاط
            </p>
            <p className="mb-4 text-xs text-gray-500">
              المعدل الحالي: 1$ = {pointsPerDollar} نقطة
            </p>

            <div className="text-left mb-3">
              <label className="text-xs text-gray-600 dark:text-gray-300 mb-1 block">
                مبلغ الدولار المراد فكه (رصيد المستخدم: {User?.dollars || 0} $):
              </label>
              <input
                type="number"
                value={exchangeAmount}
                onChange={(e) => setExchangeAmount(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder={`${User?.dollars || 0}`}
                className="w-full rounded border-[1.5px] border-stroke bg-transparent px-4 py-2.5 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                min={1}
                max={User?.dollars || 0}
                onWheel={(e) => e.currentTarget.blur()}
              />
            </div>

            {exchangeAmount !== '' && Number(exchangeAmount) > 0 && (
              <div className="mb-4 p-2.5 rounded bg-blue-50 dark:bg-blue-900/20 text-xs text-blue-700 dark:text-blue-300">
                سيحصل المستخدم على: <strong>{(Number(exchangeAmount) * pointsPerDollar).toLocaleString()}</strong> نقطة
              </div>
            )}

            <div className="mt-4 flex w-full items-center space-x-3">
              <button
                disabled={loading}
                className="flex w-full justify-center rounded bg-primary p-2.5 font-medium text-white hover:bg-opacity-90 disabled:opacity-50"
                onClick={handleExchangeDollars}
              >
                تأكيد الفك والتحويل
              </button>
              <button
                disabled={loading}
                className="flex w-full justify-center rounded bg-slate-400 p-2.5 font-medium text-white hover:bg-opacity-90 disabled:opacity-50"
                onClick={() => {
                  setShowExchangeModal(false);
                  setExchangeAmount('');
                }}
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {showBalanceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-700 bg-opacity-50">
          <div className="rounded-lg bg-white p-6 shadow-lg dark:bg-boxdark max-w-md w-full mx-4">
            <p className="mb-2 text-lg font-semibold text-black dark:text-white text-center">
              {balanceTarget === 'dollars' ? '💵 إدارة رصيد الدولارات ($)' : '🪙 إدارة رصيد النقاط (Coins)'}
            </p>
            <p className="mb-4 text-xs text-gray-500 text-center">
              الرصيد الحالي للمستخدم:{' '}
              <strong className="text-black dark:text-white">
                {balanceTarget === 'dollars' ? `${User?.dollars || 0} $` : `${(User?.coins || 0).toLocaleString()} نقطة`}
              </strong>
            </p>

            {/* اختيار نوع الرصيد */}
            <div className="mb-3">
              <label className="text-xs text-gray-600 dark:text-gray-300 mb-1 block">نوع المحفظة:</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  className={`py-2 text-xs font-semibold rounded border transition ${
                    balanceTarget === 'dollars'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                      : 'border-stroke dark:border-strokedark text-gray-600 dark:text-gray-400'
                  }`}
                  onClick={() => setBalanceTarget('dollars')}
                >
                  💵 دولارات ($)
                </button>
                <button
                  type="button"
                  className={`py-2 text-xs font-semibold rounded border transition ${
                    balanceTarget === 'coins'
                      ? 'border-blue-600 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                      : 'border-stroke dark:border-strokedark text-gray-600 dark:text-gray-400'
                  }`}
                  onClick={() => setBalanceTarget('coins')}
                >
                  🪙 نقاط (Coins)
                </button>
              </div>
            </div>

            {/* اختيار نوع العملية */}
            <div className="mb-3">
              <label className="text-xs text-gray-600 dark:text-gray-300 mb-1 block">نوع العملية:</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  className={`py-1.5 text-xs font-semibold rounded border transition ${
                    balanceOperation === 'add'
                      ? 'border-green-600 bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      : 'border-stroke dark:border-strokedark text-gray-600 dark:text-gray-400'
                  }`}
                  onClick={() => setBalanceOperation('add')}
                >
                  ➕ إضافة
                </button>
                <button
                  type="button"
                  className={`py-1.5 text-xs font-semibold rounded border transition ${
                    balanceOperation === 'set'
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-stroke dark:border-strokedark text-gray-600 dark:text-gray-400'
                  }`}
                  onClick={() => setBalanceOperation('set')}
                >
                  ✏️ ضبط القيمة
                </button>
                <button
                  type="button"
                  className={`py-1.5 text-xs font-semibold rounded border transition ${
                    balanceOperation === 'deduct'
                      ? 'border-red-600 bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      : 'border-stroke dark:border-strokedark text-gray-600 dark:text-gray-400'
                  }`}
                  onClick={() => setBalanceOperation('deduct')}
                >
                  ➖ خصم
                </button>
              </div>
            </div>

            {/* إدخال المبلغ */}
            <div className="text-left mb-4">
              <label className="text-xs text-gray-600 dark:text-gray-300 mb-1 block">
                {balanceOperation === 'add' ? 'المبلغ المراد إضافته:' : balanceOperation === 'set' ? 'القيمة الجديدة للرصيد:' : 'المبلغ المراد خصمه:'}
              </label>
              <input
                type="number"
                value={balanceAmount}
                onChange={(e) => setBalanceAmount(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder={balanceTarget === 'dollars' ? '0 $' : '0 نقطة'}
                className="w-full rounded border-[1.5px] border-stroke bg-transparent px-4 py-2.5 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                min={0}
                onWheel={(e) => e.currentTarget.blur()}
              />
            </div>

            <div className="mt-4 flex w-full items-center space-x-3">
              <button
                disabled={loading}
                className="flex w-full justify-center rounded bg-primary p-2.5 font-medium text-white hover:bg-opacity-90 disabled:opacity-50"
                onClick={handleUpdateBalance}
              >
                تأكيد العملية
              </button>
              <button
                disabled={loading}
                className="flex w-full justify-center rounded bg-slate-400 p-2.5 font-medium text-white hover:bg-opacity-90 disabled:opacity-50"
                onClick={() => {
                  setShowBalanceModal(false);
                  setBalanceAmount('');
                }}
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserProfile;