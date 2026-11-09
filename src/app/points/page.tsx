'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useStore } from '@/components/ThemeContextProvider';
import {
  Gift,
  Search,
  Star,
  Award,
  Clock,
  CheckCircle,
  AlertCircle,
  Sparkles,
  MessageSquareHeart,
  Send,
  Lock,
  ClipboardList,
} from 'lucide-react';
import confetti from 'canvas-confetti';

function PointsContent() {
  const searchParams = useSearchParams();
  const qParam = searchParams.get('q') || '';
  const { settings } = useStore();

  const [searchInput, setSearchInput] = useState(qParam);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Review Form state
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewName, setReviewName] = useState('');
  const [reviewContact, setReviewContact] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSuccessMsg, setReviewSuccessMsg] = useState('');
  const [reviewError, setReviewError] = useState('');

  // Redeem Reward state
  const [redeeming, setRedeeming] = useState(false);
  const [redeemSuccessMsg, setRedeemSuccessMsg] = useState('');

  const lookupPoints = async (query: string) => {
    if (!query.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/points/lookup?q=${encodeURIComponent(query.trim())}`);
      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.error || 'ไม่พบข้อมูลแต้มสะสม');
      }
      setData(resData);
      setReviewName(resData.customer?.name || '');
      setReviewContact(resData.customer?.contactId || '');
    } catch (e: any) {
      setError(e.message || 'เกิดข้อผิดพลาดในการค้นหา');
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (qParam) {
      setSearchInput(qParam);
      lookupPoints(qParam);
    }
  }, [qParam]);

  let rewardsList: string[] = ['ส่วนลด STK', 'นฟ', 'CP', 'DM'];
  try {
    if (settings.rewardsListJson) {
      rewardsList = JSON.parse(settings.rewardsListJson);
    }
  } catch {}

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewName.trim() || !reviewComment.trim()) {
      setReviewError('กรุณากรอกชื่อและข้อความรีวิวให้ครบถ้วน');
      return;
    }

    setReviewSubmitting(true);
    setReviewError('');
    setReviewSuccessMsg('');

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: reviewName.trim(),
          contactPlatform: 'Line',
          contactId: reviewContact.trim(),
          queueNumber: searchInput.trim(),
          rating: reviewRating,
          comment: reviewComment.trim(),
        }),
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.error || 'เกิดข้อผิดพลาดในการส่งรีวิว');
      }

      setReviewSuccessMsg(resData.message || 'ส่งรีวิวเรียบร้อยแล้วค่ะ! แอดมินจะรีบอนุมัตินะคะ 💖');
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
      setReviewComment('');
      setShowReviewForm(false);
    } catch (err: any) {
      setReviewError(err.message || 'ไม่สามารถส่งรีวิวได้');
    } finally {
      setReviewSubmitting(false);
    }
  };

  const handleRedeem = async (rewardName: string) => {
    if (!data?.customer?.id) return;
    if (data.customer.pointsBalance < 10) {
      alert('แต้มสะสมยังไม่ครบ 10 แต้มค่ะ');
      return;
    }

    if (!confirm(`คุณต้องการใช้ 10 แต้มเพื่อแลก "${rewardName}" ใช่หรือไม่?`)) {
      return;
    }

    setRedeeming(true);
    setRedeemSuccessMsg('');
    try {
      const res = await fetch('/api/points/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: data.customer.id,
          rewardName,
          pointsRequired: 10,
        }),
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.error || 'เกิดข้อผิดพลาดในการแลก');
      }

      setRedeemSuccessMsg(resData.message);
      confetti({ particleCount: 100, spread: 90, origin: { y: 0.6 } });
      lookupPoints(searchInput);
    } catch (err: any) {
      alert(err.message || 'ไม่สามารถแลกของรางวัลได้');
    } finally {
      setRedeeming(false);
    }
  };

  const points = data?.customer?.pointsBalance || 0;
  const target = 10;

  return (
    <div className="max-w-xl mx-auto px-4 pb-28 pt-4">
      {/* Page Header */}
      <div className="text-center mb-6">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-700 text-xs font-bold font-thai mb-2">
          🎁 ระบบสะสมแต้ม (Loyalty Points)
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-800 font-thai">
          สะสมแต้มกับเชอไน้
        </h1>
        {/* Verbatim Description */}
        <p className="text-xs sm:text-sm text-rose-600 font-thai mt-2 max-w-md mx-auto font-medium leading-relaxed bg-rose-50 p-2.5 rounded-2xl border border-rose-200">
          "สงวนสิทธิ์ให้เฉพาะลูกค้าที่รีวิวให้กับทางร้านเท่านั้น หากสะสมครบมีรางวัลสุดพิเศษให้เลือกเย้อมากก"
        </p>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-rose-100 mb-6">
        <label className="block text-xs font-semibold text-gray-600 font-thai mb-1.5">
          ค้นหาแต้มด้วย ชื่อลูกค้า หรือ หมายเลขคิว (เช่น SN001)
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="กรอกชื่อ หรือเลขคิว เช่น SN001"
            className="flex-1 px-4 py-2.5 rounded-2xl border border-rose-100 bg-rose-50/20 focus:bg-white focus:border-rose-400 focus:outline-none text-sm font-thai"
          />
          <button
            type="button"
            onClick={() => lookupPoints(searchInput)}
            disabled={loading}
            className="px-5 py-2.5 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs sm:text-sm font-thai shadow-sm transition-all active:scale-95 flex items-center gap-1.5 disabled:opacity-50"
          >
            <Search className="w-4 h-4" />
            <span>{loading ? 'ค้นหา...' : 'เช็คแต้ม'}</span>
          </button>
        </div>

        {error && (
          <p className="text-xs text-rose-500 font-thai mt-2 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>{error}</span>
          </p>
        )}
      </div>

      {/* Feedback Messages */}
      {reviewSuccessMsg && (
        <div className="mb-5 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-thai flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{reviewSuccessMsg}</span>
        </div>
      )}

      {redeemSuccessMsg && (
        <div className="mb-5 p-4 rounded-2xl bg-pink-50 border border-pink-300 text-rose-900 text-xs sm:text-sm font-thai flex items-start gap-2.5 shadow-sm">
          <Sparkles className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
          <div className="leading-relaxed font-medium">{redeemSuccessMsg}</div>
        </div>
      )}

      {/* Points Card & 10 Stamp Card */}
      {data && (
        <div className="space-y-6">
          {/* Stamp Card Header */}
          <div className="bg-gradient-to-br from-rose-500 via-pink-500 to-rose-600 rounded-3xl p-6 text-white shadow-xl shadow-rose-200 relative overflow-hidden">
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="text-xs font-thai text-rose-100 uppercase tracking-wider">
                  SHERNICE REWARD CARD
                </span>
                <h2 className="text-xl sm:text-2xl font-bold font-thai">
                  คุณ {data.customer.name}
                </h2>
              </div>
              <div className="text-right">
                <span className="text-xs font-thai text-rose-100">แต้มปัจจุบัน</span>
                <div className="text-3xl sm:text-4xl font-extrabold font-mono">
                  {points} <span className="text-sm font-thai font-normal">/ 10</span>
                </div>
              </div>
            </div>

            {/* Stamp grid (1 to 10 stamps) */}
            <div className="grid grid-cols-5 gap-2 sm:gap-3 my-4">
              {Array.from({ length: 10 }).map((_, idx) => {
                const isStamped = idx < points;
                return (
                  <div
                    key={idx}
                    className={`aspect-square rounded-2xl flex flex-col items-center justify-center p-1 border-2 transition-all duration-300 ${
                      isStamped
                        ? 'bg-white text-rose-600 border-white shadow-md scale-105'
                        : 'bg-white/10 text-white/50 border-white/30'
                    }`}
                  >
                    {isStamped ? (
                      <Sparkles className="w-5 h-5 fill-rose-500 text-rose-500 animate-pulse" />
                    ) : (
                      <span className="text-xs font-mono font-bold">{idx + 1}</span>
                    )}
                    <span className="text-[9px] font-thai font-semibold mt-0.5">
                      {idx === 9 ? '🎁 รางวัล' : `${idx + 1} แต้ม`}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Eligibility Note */}
            <div className="mt-4 pt-3 border-t border-white/20 flex items-center justify-between text-xs font-thai">
              <span>สถานะสิทธิ์รีวิว:</span>
              {data.hasApprovedReview ? (
                <span className="inline-flex items-center gap-1 font-bold text-emerald-200 bg-emerald-900/40 px-2.5 py-0.5 rounded-full">
                  <CheckCircle className="w-3.5 h-3.5" /> รีวิวผ่านแล้ว (มีสิทธิ์รับแต้ม)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 font-bold text-amber-200 bg-amber-900/40 px-2.5 py-0.5 rounded-full">
                  <Lock className="w-3.5 h-3.5" /> ยังไม่พบรีวิวที่อนุมัติ
                </span>
              )}
            </div>
          </div>

          {/* Customer Orders & Slip Status Section */}
          {data.customerOrders && data.customerOrders.length > 0 && (
            <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-sm border border-rose-100 space-y-3 font-thai text-xs sm:text-sm">
              <h4 className="font-bold text-gray-800 flex items-center gap-1.5 text-sm">
                <ClipboardList className="w-4 h-4 text-rose-500" />
                <span>สถานะออเดอร์และการสะสมแต้ม</span>
              </h4>
              <div className="divide-y divide-rose-50">
                {data.customerOrders.map((ord: any) => (
                  <div key={ord.id} className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                    <div>
                      <span className="font-mono font-bold text-rose-600 mr-2">{ord.queueNumber}</span>
                      <span className="text-gray-700">{ord.heroName} - {ord.skinName}</span>
                    </div>
                    <div>
                      {ord.slipApproved ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                          <CheckCircle className="w-3 h-3 text-emerald-600" /> อนุมัติสลิปแล้ว (+1 แต้ม)
                        </span>
                      ) : ord.slipUrl ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
                          <Clock className="w-3 h-3 text-blue-600" /> รอแอดมินอนุมัติสลิปโอนเงิน
                        </span>
                      ) : (
                        <a
                          href={`/payment?queue=${ord.queueNumber}`}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 px-2.5 py-0.5 rounded-full transition-colors"
                        >
                          ยังไม่แนบสลิป (คลิกแนบสลิป)
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {data.customerOrders.some((o: any) => o.slipUrl && !o.slipApproved) && (
                <p className="text-[11px] text-blue-700 bg-blue-50/70 p-2.5 rounded-xl border border-blue-100 leading-relaxed">
                  💡 ทางร้านได้รับสลิปของคุณแล้วนะคะ กำลังรอแอดมินกดอนุมัติสลิป เมื่อสลิปผ่านการอนุมัติแต้มสะสมจะเพิ่มขึ้นทันทีค่ะ
                </p>
              )}
            </div>
          )}

          {/* Prompt to leave a review if not reviewed */}
          {!data.hasApprovedReview && (
            <div className="p-4 rounded-3xl bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm font-thai">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-2 flex-1">
                  <p className="font-semibold">
                    คุณยังไม่ได้รับสิทธิ์แต้มสะสม เนื่องจากยังไม่มีรีวิวที่ผ่านการอนุมัติ
                  </p>
                  <p className="text-xs text-amber-800">
                    เพียงเขียนรีวิวความประทับใจให้กับร้าน เมื่อแอดมินอนุมัติรีวิว
                    แต้มจากทุกสลิปที่คุณโอนจะถูกเพิ่มเข้าบัญชีของคุณทันทีค่ะ!
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowReviewForm(true)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-sm active:scale-95 transition-all"
                  >
                    <MessageSquareHeart className="w-4 h-4" />
                    <span>เขียนรีวิวให้ทางร้านตอนนี้เลย ✨</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Rewards List */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-rose-100">
            <h3 className="text-base sm:text-lg font-bold text-gray-800 font-thai mb-1 flex items-center gap-2">
              <Gift className="w-5 h-5 text-rose-500" />
              <span>รายการของรางวัล (เป้าหมาย 10 แต้ม)</span>
            </h3>
            {/* Verbatim Rewards text */}
            <p className="text-xs text-gray-500 font-thai mb-4">
              "เมื่อสะสมครบตามเงื่อนไข สามารถเลือกของรางวัลได้"
            </p>

            <div className="grid grid-cols-2 gap-3">
              {rewardsList.map((reward, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl border border-rose-100 bg-rose-50/30 flex flex-col justify-between"
                >
                  <div>
                    <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center font-bold text-xs font-mono mb-2">
                      #{idx + 1}
                    </div>
                    <div className="font-bold text-sm text-gray-800 font-thai">{reward}</div>
                    <div className="text-[11px] text-gray-500 font-thai mt-0.5">ใช้ 10 แต้ม</div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRedeem(reward)}
                    disabled={points < 10 || redeeming}
                    className={`mt-3 py-1.5 px-3 rounded-xl font-bold text-xs font-thai transition-all active:scale-95 ${
                      points >= 10
                        ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-sm shadow-rose-200'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {points >= 10 ? 'กดแลกรางวัล' : 'แต้มยังไม่พอ'}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Point Ledger: Earned & Redeemed History */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-rose-100">
            <h3 className="text-base sm:text-lg font-bold text-gray-800 font-thai mb-3 flex items-center gap-2">
              <Clock className="w-5 h-5 text-rose-500" />
              <span>ประวัติแต้มสะสม (Point Ledger)</span>
            </h3>

            {(!data.allTransactions || data.allTransactions.length === 0) ? (
              <p className="text-xs text-gray-400 font-thai text-center py-4">
                ยังไม่มีประวัติการทำรายการแต้ม
              </p>
            ) : (
              <div className="divide-y divide-rose-50">
                {data.allTransactions.map((tx: any) => (
                  <div key={tx.id} className="py-2.5 flex items-center justify-between text-xs sm:text-sm font-thai">
                    <div>
                      <div className="font-semibold text-gray-800">{tx.reason}</div>
                      <div className="text-[11px] text-gray-400">
                        {new Date(tx.createdAt).toLocaleString('th-TH')}
                      </div>
                    </div>
                    <div
                      className={`font-mono font-bold text-sm ${
                        tx.amount > 0 ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {tx.amount > 0 ? `+${tx.amount}` : tx.amount} แต้ม
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Review Submission Button & Form */}
      <div className="mt-6">
        {!showReviewForm ? (
          <button
            type="button"
            onClick={() => setShowReviewForm(true)}
            className="w-full py-3.5 px-6 rounded-3xl bg-white border-2 border-rose-200 text-rose-600 font-bold text-sm font-thai shadow-sm hover:bg-rose-50 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <MessageSquareHeart className="w-5 h-5 text-rose-500" />
            <span>เขียนรีวิวให้ทางร้าน (ปลดล็อกสิทธิ์รับแต้ม)</span>
          </button>
        ) : (
          <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-md border border-rose-200 animate-fade-in">
            <h3 className="text-base sm:text-lg font-bold text-gray-800 font-thai mb-1 flex items-center gap-2">
              <MessageSquareHeart className="w-5 h-5 text-rose-500" />
              <span>ส่งรีวิวให้ร้านเชอไน้</span>
            </h3>
            <p className="text-xs text-gray-500 font-thai mb-4">
              รีวิวจะได้รับการตรวจสอบและอนุมัติโดยแอดมิน เพื่อมอบแต้มสะสมให้คุณค่ะ
            </p>

            {reviewError && (
              <p className="text-xs text-rose-500 font-thai mb-3">{reviewError}</p>
            )}

            <form onSubmit={handleReviewSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-gray-700 font-thai mb-1">
                  ชื่อของคุณ <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={reviewName}
                  onChange={(e) => setReviewName(e.target.value)}
                  placeholder="ชื่อที่ใช้สั่งงาน"
                  className="w-full px-4 py-2.5 rounded-2xl border border-rose-100 bg-rose-50/20 focus:bg-white focus:border-rose-400 focus:outline-none text-sm font-thai"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 font-thai mb-1">
                  Line ID หรือ ช่องทางติดต่อ
                </label>
                <input
                  type="text"
                  value={reviewContact}
                  onChange={(e) => setReviewContact(e.target.value)}
                  placeholder="เช่น @line_id เพื่อให้ระบบเชื่อมโยงแต้มให้ถูกต้อง"
                  className="w-full px-4 py-2.5 rounded-2xl border border-rose-100 bg-rose-50/20 focus:bg-white focus:border-rose-400 focus:outline-none text-sm font-thai"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 font-thai mb-1">
                  ความพึงพอใจ
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className="p-1 transition-transform active:scale-125"
                    >
                      <Star
                        className={`w-7 h-7 ${
                          star <= reviewRating
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 font-thai mb-1">
                  ข้อความรีวิว <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="งานสวยมากค่ะ ตัดเนียนกริบ สั่งซ้ำแน่นอน..."
                  className="w-full px-4 py-2.5 rounded-2xl border border-rose-100 bg-rose-50/20 focus:bg-white focus:border-rose-400 focus:outline-none text-sm font-thai"
                />
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowReviewForm(false)}
                  className="px-4 py-2.5 rounded-2xl border border-gray-200 text-gray-600 font-thai text-xs font-bold"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={reviewSubmitting}
                  className="flex-1 py-2.5 px-4 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs sm:text-sm font-thai shadow-sm flex items-center justify-center gap-1.5 transition-all active:scale-95 disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{reviewSubmitting ? 'กำลังส่งรีวิว...' : 'ส่งรีวิวเลย ✨'}</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Reserved Space for Future Notes */}
      <div className="mt-8 p-4 rounded-2xl bg-rose-50/40 border border-rose-100 text-center">
        <span className="text-xs text-rose-400 font-thai font-medium">
          {settings.notes || 'สงวนสิทธิ์ให้เฉพาะลูกค้าที่รีวิวให้กับทางร้านเท่านั้น หากสะสมครบมีรางวัลสุดพิเศษให้เลือกเย้อมากก'}
        </span>
      </div>
    </div>
  );
}

export default function PointsPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center font-thai text-rose-500">กำลังโหลด...</div>}>
      <PointsContent />
    </Suspense>
  );
}
