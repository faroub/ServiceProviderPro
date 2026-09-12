import React, { useState } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, Check, X, Ban, Settings2, RefreshCw } from 'lucide-react';

export interface DayScheduleConfig {
  active: boolean;
  startTime: string; // "08:00"
  endTime: string;   // "17:00"
}

export type WeeklyScheduleConfig = {
  mon: DayScheduleConfig;
  tue: DayScheduleConfig;
  wed: DayScheduleConfig;
  thu: DayScheduleConfig;
  fri: DayScheduleConfig;
  sat: DayScheduleConfig;
  sun: DayScheduleConfig;
};

export interface DateOverride {
  date: string; // "YYYY-MM-DD"
  status: 'available' | 'blocked';
  startTime?: string;
  endTime?: string;
}

export type DateOverridesMap = Record<string, DateOverride>;

interface ProviderScheduleManagerProps {
  schedule: WeeklyScheduleConfig;
  onUpdateSchedule: (newSchedule: WeeklyScheduleConfig) => void;
  overrides: DateOverridesMap;
  onUpdateOverrides: (newOverrides: DateOverridesMap) => void;
  t: any;
  lang: string;
}

const TIME_OPTIONS = [
  "06:00", "07:00", "08:00", "09:00", "10:00", "11:00", "12:00",
  "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00"
];

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const MONTH_NAMES_FR = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
];

const MONTH_NAMES_AR = [
  "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
  "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"
];

const DAY_KEYS: (keyof WeeklyScheduleConfig)[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

export const ProviderScheduleManager: React.FC<ProviderScheduleManagerProps> = ({
  schedule,
  onUpdateSchedule,
  overrides,
  onUpdateOverrides,
  t,
  lang,
}) => {
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [editingDate, setEditingDate] = useState<string | null>(null);

  // Form states for custom date editing
  const [modalStatus, setModalStatus] = useState<'weekly' | 'custom' | 'blocked'>('weekly');
  const [modalStart, setModalStart] = useState('09:00');
  const [modalEnd, setModalEnd] = useState('17:00');

  // Compute exact week dates for weekly hours section
  const getWeekDates = (offset: number) => {
    const now = new Date();
    const currentDay = now.getDay(); // 0 is Sun, 1 is Mon...
    const distanceToMon = (currentDay + 6) % 7;
    const monday = new Date(now);
    monday.setDate(now.getDate() - distanceToMon + offset * 7);

    const dayLabelsEN = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const dayLabelsFR = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
    const dayLabelsAR = ['الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت', 'الأحد'];

    return DAY_KEYS.map((key, idx) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + idx);
      const dateStr = d.toISOString().split('T')[0];
      const monthStr = d.toLocaleDateString(lang === 'ar' ? 'ar-DZ' : lang === 'fr' ? 'fr-FR' : 'en-US', { month: 'short', day: 'numeric' });
      
      let dayName = dayLabelsEN[idx];
      if (lang === 'fr') dayName = dayLabelsFR[idx];
      if (lang === 'ar') dayName = dayLabelsAR[idx];

      return {
        key,
        dayName,
        dateStr,
        monthStr,
        fullDate: d,
      };
    });
  };

  const weekDays = getWeekDates(weekOffset);
  const startWeekFormatted = weekDays[0].monthStr;
  const endWeekFormatted = weekDays[6].monthStr + `, ${weekDays[6].fullDate.getFullYear()}`;

  // Helper to calculate hours difference
  const calcHoursDiff = (start: string, end: string) => {
    const sH = parseInt(start.split(':')[0], 10);
    const eH = parseInt(end.split(':')[0], 10);
    return Math.max(0, eH - sH);
  };

  const handleToggleDay = (dayKey: keyof WeeklyScheduleConfig) => {
    onUpdateSchedule({
      ...schedule,
      [dayKey]: {
        ...schedule[dayKey],
        active: !schedule[dayKey].active,
      },
    });
  };

  const handleTimeChange = (dayKey: keyof WeeklyScheduleConfig, field: 'startTime' | 'endTime', value: string) => {
    onUpdateSchedule({
      ...schedule,
      [dayKey]: {
        ...schedule[dayKey],
        [field]: value,
      },
    });
  };

  // Calendar Grid Generator for selectedMonth & selectedYear
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonthOffset = (year: number, month: number) => {
    const day = new Date(year, month, 1).getDay(); // 0 is Sun
    return (day + 6) % 7; // Convert to Mon=0
  };

  const totalDays = getDaysInMonth(selectedYear, selectedMonth);
  const startOffset = getFirstDayOfMonthOffset(selectedYear, selectedMonth);

  const openDateModal = (dateStr: string) => {
    setEditingDate(dateStr);
    const existing = overrides[dateStr];
    if (existing) {
      if (existing.status === 'blocked') {
        setModalStatus('blocked');
      } else {
        setModalStatus('custom');
        setModalStart(existing.startTime || '08:00');
        setModalEnd(existing.endTime || '17:00');
      }
    } else {
      setModalStatus('weekly');
      // default start/end from day of week
      const dateObj = new Date(dateStr);
      const dayNum = dateObj.getDay();
      const dayMap: (keyof WeeklyScheduleConfig)[] = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
      const dayKey = dayMap[dayNum];
      const cfg = schedule[dayKey];
      setModalStart(cfg?.startTime || '08:00');
      setModalEnd(cfg?.endTime || '17:00');
    }
  };

  const handleSaveDateConfig = () => {
    if (!editingDate) return;
    const newOverrides = { ...overrides };

    if (modalStatus === 'weekly') {
      delete newOverrides[editingDate];
    } else if (modalStatus === 'blocked') {
      newOverrides[editingDate] = {
        date: editingDate,
        status: 'blocked',
      };
    } else {
      newOverrides[editingDate] = {
        date: editingDate,
        status: 'available',
        startTime: modalStart,
        endTime: modalEnd,
      };
    }

    onUpdateOverrides(newOverrides);
    setEditingDate(null);
  };

  const handleBlockEntireMonth = () => {
    const newOverrides = { ...overrides };
    for (let day = 1; day <= totalDays; day++) {
      const dStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      newOverrides[dStr] = {
        date: dStr,
        status: 'blocked',
      };
    }
    onUpdateOverrides(newOverrides);
  };

  const handleResetEntireMonth = () => {
    const newOverrides = { ...overrides };
    for (let day = 1; day <= totalDays; day++) {
      const dStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      delete newOverrides[dStr];
    }
    onUpdateOverrides(newOverrides);
  };

  const monthTitle = lang === 'ar' ? MONTH_NAMES_AR[selectedMonth] : lang === 'fr' ? MONTH_NAMES_FR[selectedMonth] : MONTH_NAMES[selectedMonth];

  return (
    <div className="space-y-8">
      {/* SECTION 1: WEEKLY WORKING HOURS WITH TIME RANGES */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-400" />
              <h3 className="text-lg font-bold text-white">{t.providerDash.scheduleTitle}</h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">{t.providerDash.scheduleSubTitle}</p>
          </div>

          {/* Week Date Navigator */}
          <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl p-1.5 self-start sm:self-auto">
            <button
              onClick={() => setWeekOffset(prev => prev - 1)}
              className="p-1.5 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg transition-colors"
              title={t.providerDash.prevWeek}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="text-xs font-bold text-amber-400 px-2 flex items-center gap-1.5">
              <CalendarIcon className="w-3.5 h-3.5 text-amber-400" />
              <span>{t.providerDash.weekOf} {startWeekFormatted} – {endWeekFormatted}</span>
            </div>
            {weekOffset !== 0 && (
              <button
                onClick={() => setWeekOffset(0)}
                className="text-[10px] font-bold bg-amber-500/15 border border-amber-500/30 text-amber-300 px-2 py-0.5 rounded-md hover:bg-amber-500/25 transition-colors"
              >
                {t.providerDash.currentWeek}
              </button>
            )}
            <button
              onClick={() => setWeekOffset(prev => prev + 1)}
              className="p-1.5 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg transition-colors"
              title={t.providerDash.nextWeek}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 7 Day Working Hours Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-3">
          {weekDays.map(({ key, dayName, monthStr }) => {
            const dayCfg = schedule[key];
            const hrs = dayCfg.active ? calcHoursDiff(dayCfg.startTime, dayCfg.endTime) : 0;

            return (
              <div
                key={key}
                className={`rounded-2xl border p-3.5 transition-all flex flex-col justify-between ${
                  dayCfg.active
                    ? 'bg-slate-950/90 border-amber-500/30 shadow-sm hover:border-amber-500/50'
                    : 'bg-slate-950/40 border-slate-800/80 opacity-60'
                }`}
              >
                {/* Day Header */}
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-xs font-black uppercase text-white tracking-wide">{dayName.slice(0, 3)}</span>
                    <button
                      type="button"
                      onClick={() => handleToggleDay(key)}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full transition-colors ${
                        dayCfg.active
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}
                    >
                      {dayCfg.active ? t.providerDash.open : t.providerDash.closed}
                    </button>
                  </div>
                  <div className="text-[11px] text-amber-400 font-semibold mb-3">
                    {monthStr}
                  </div>
                </div>

                {/* Working Hours Selectors */}
                {dayCfg.active ? (
                  <div className="space-y-2 pt-2 border-t border-slate-800/60">
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-0.5 font-medium">{t.providerDash.startTime}</label>
                      <select
                        value={dayCfg.startTime}
                        onChange={(e) => handleTimeChange(key, 'startTime', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white outline-none focus:border-amber-400"
                      >
                        {TIME_OPTIONS.slice(0, -2).map(tOpt => (
                          <option key={`start-${tOpt}`} value={tOpt}>{tOpt}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] text-slate-400 block mb-0.5 font-medium">{t.providerDash.endTime}</label>
                      <select
                        value={dayCfg.endTime}
                        onChange={(e) => handleTimeChange(key, 'endTime', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white outline-none focus:border-amber-400"
                      >
                        {TIME_OPTIONS.filter(tOpt => tOpt > dayCfg.startTime).map(tOpt => (
                          <option key={`end-${tOpt}`} value={tOpt}>{tOpt}</option>
                        ))}
                      </select>
                    </div>

                    <div className="text-[10px] text-center text-slate-400 font-medium pt-1">
                      ⏱ {hrs} {hrs === 1 ? 'hour' : 'hours'} / day
                    </div>
                  </div>
                ) : (
                  <div className="py-6 text-center border-t border-slate-800/60">
                    <span className="text-[11px] font-semibold text-slate-500">{t.providerDash.closed}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 2: CALENDAR AVAILABILITY PLANNER (ALL MONTHS & YEARS) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-amber-400" />
              <h3 className="text-lg font-bold text-white">{t.providerDash.monthlyPlannerTitle}</h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">{t.providerDash.monthlyPlannerSubtitle}</p>
          </div>

          {/* Month & Year Controls */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Month Dropdown */}
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value, 10))}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-white outline-none focus:border-amber-400"
            >
              {(lang === 'ar' ? MONTH_NAMES_AR : lang === 'fr' ? MONTH_NAMES_FR : MONTH_NAMES).map((mName, mIdx) => (
                <option key={`m-${mIdx}`} value={mIdx}>{mName}</option>
              ))}
            </select>

            {/* Year Selector Stepper */}
            <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-1">
              <button
                type="button"
                onClick={() => setSelectedYear(prev => prev - 1)}
                className="p-1 hover:bg-slate-800 text-slate-300 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="text-xs font-bold text-amber-400 px-3">{selectedYear}</span>
              <button
                type="button"
                onClick={() => setSelectedYear(prev => prev + 1)}
                className="p-1 hover:bg-slate-800 text-slate-300 rounded-lg transition-colors"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Bulk Actions */}
            <button
              type="button"
              onClick={handleBlockEntireMonth}
              className="bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-400 text-xs font-semibold px-3 py-2 rounded-xl transition-colors flex items-center gap-1.5"
            >
              <Ban className="w-3.5 h-3.5" />
              <span>{t.providerDash.markMonthBlocked}</span>
            </button>

            <button
              type="button"
              onClick={handleResetEntireMonth}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-semibold px-3 py-2 rounded-xl transition-colors flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{t.providerDash.applyWeeklyToMonth}</span>
            </button>
          </div>
        </div>

        {/* Calendar Legend */}
        <div className="flex flex-wrap items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-emerald-500/20 border border-emerald-500/50" />
            <span className="text-slate-300">{t.providerDash.weeklyDefault}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-blue-500/20 border border-blue-500/50" />
            <span className="text-slate-300">{t.providerDash.customHours}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-red-500/20 border border-red-500/50" />
            <span className="text-slate-300">{t.providerDash.blockedDate}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-slate-950 border border-slate-800" />
            <span className="text-slate-500">{t.providerDash.closed}</span>
          </div>
        </div>

        {/* Full Month Calendar Grid */}
        <div className="space-y-2">
          {/* Weekday Labels */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center text-xs font-bold text-slate-400 uppercase py-2 border-b border-slate-800/60">
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
            <div>Sun</div>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {/* Empty offset cells */}
            {Array.from({ length: startOffset }).map((_, idx) => (
              <div key={`empty-${idx}`} className="h-16 rounded-xl bg-slate-950/20 border border-transparent" />
            ))}

            {/* Actual Days */}
            {Array.from({ length: totalDays }).map((_, idx) => {
              const dayNum = idx + 1;
              const dateStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
              
              const override = overrides[dateStr];
              
              // Get day of week
              const dObj = new Date(selectedYear, selectedMonth, dayNum);
              const dayIndex = dObj.getDay();
              const dayMap: (keyof WeeklyScheduleConfig)[] = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
              const dayKey = dayMap[dayIndex];
              const weeklyCfg = schedule[dayKey];

              let badgeStyle = "bg-slate-950 border-slate-800 text-slate-400";
              let labelText = "Weekly Off";

              if (override) {
                if (override.status === 'blocked') {
                  badgeStyle = "bg-red-500/15 border-red-500/40 text-red-400 font-bold";
                  labelText = "Blocked";
                } else {
                  badgeStyle = "bg-blue-500/15 border-blue-500/40 text-blue-300 font-bold";
                  labelText = `${override.startTime} - ${override.endTime}`;
                }
              } else if (weeklyCfg?.active) {
                badgeStyle = "bg-emerald-500/10 border-emerald-500/30 text-emerald-400";
                labelText = `${weeklyCfg.startTime} - ${weeklyCfg.endTime}`;
              }

              const isToday = new Date().toISOString().split('T')[0] === dateStr;

              return (
                <button
                  key={dateStr}
                  type="button"
                  onClick={() => openDateModal(dateStr)}
                  className={`h-20 sm:h-24 p-2 rounded-xl border transition-all text-left flex flex-col justify-between group hover:border-amber-400/80 hover:scale-[1.02] ${badgeStyle} ${
                    isToday ? 'ring-2 ring-amber-400 ring-offset-2 ring-offset-slate-900' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs sm:text-sm font-black ${isToday ? 'text-amber-400' : 'text-white'}`}>
                      {dayNum}
                    </span>
                    {override && (
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" title="Custom Override Active" />
                    )}
                  </div>

                  <div className="text-[10px] sm:text-[11px] font-medium leading-tight truncate">
                    {labelText}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* EDIT DATE AVAILABILITY MODAL */}
      {editingDate && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl relative">
            <button
              type="button"
              onClick={() => setEditingDate(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h4 className="text-base font-bold text-white flex items-center gap-2">
                <Settings2 className="w-5 h-5 text-amber-400" />
                <span>Date Availability: {editingDate}</span>
              </h4>
              <p className="text-xs text-slate-400 mt-1">
                Customize professional availability or mark personal vacation for this date.
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <label className="font-semibold text-slate-300 block">Select Availability Status</label>
              <div className="grid grid-cols-1 gap-2">
                <button
                  type="button"
                  onClick={() => setModalStatus('weekly')}
                  className={`p-3 rounded-xl border text-left transition-colors flex items-center justify-between ${
                    modalStatus === 'weekly'
                      ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 font-bold'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  <div>
                    <div className="font-bold">{t.providerDash.resetToWeekly}</div>
                    <div className="text-[11px] font-normal text-slate-400">Follow default weekly working hours</div>
                  </div>
                  {modalStatus === 'weekly' && <Check className="w-4 h-4 text-emerald-400" />}
                </button>

                <button
                  type="button"
                  onClick={() => setModalStatus('custom')}
                  className={`p-3 rounded-xl border text-left transition-colors flex items-center justify-between ${
                    modalStatus === 'custom'
                      ? 'bg-blue-500/15 border-blue-500/40 text-blue-300 font-bold'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  <div>
                    <div className="font-bold">{t.providerDash.setCustomHours}</div>
                    <div className="text-[11px] font-normal text-slate-400">Specify special start and end times for this date</div>
                  </div>
                  {modalStatus === 'custom' && <Check className="w-4 h-4 text-blue-400" />}
                </button>

                <button
                  type="button"
                  onClick={() => setModalStatus('blocked')}
                  className={`p-3 rounded-xl border text-left transition-colors flex items-center justify-between ${
                    modalStatus === 'blocked'
                      ? 'bg-red-500/15 border-red-500/40 text-red-300 font-bold'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  <div>
                    <div className="font-bold">{t.providerDash.blockDay}</div>
                    <div className="text-[11px] font-normal text-slate-400">Mark as vacation or unavailable for client bookings</div>
                  </div>
                  {modalStatus === 'blocked' && <Check className="w-4 h-4 text-red-400" />}
                </button>
              </div>

              {/* Custom Hours Selectors */}
              {modalStatus === 'custom' && (
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="text-slate-300 block mb-1 font-semibold">{t.providerDash.startTime}</label>
                    <select
                      value={modalStart}
                      onChange={(e) => setModalStart(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-amber-400"
                    >
                      {TIME_OPTIONS.slice(0, -2).map(tOpt => (
                        <option key={`mstart-${tOpt}`} value={tOpt}>{tOpt}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-slate-300 block mb-1 font-semibold">{t.providerDash.endTime}</label>
                    <select
                      value={modalEnd}
                      onChange={(e) => setModalEnd(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-amber-400"
                    >
                      {TIME_OPTIONS.filter(tOpt => tOpt > modalStart).map(tOpt => (
                        <option key={`mend-${tOpt}`} value={tOpt}>{tOpt}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={handleSaveDateConfig}
                className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-2.5 rounded-xl text-xs transition-colors shadow-md"
              >
                Save Availability Rule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
