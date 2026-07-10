// ==================== 데이터 관리 ==================== 

// 로컬스토리지에서 데이터 가져오기
const getStorageData = (key, defaultValue = []) => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : defaultValue;
};

// 로컬스토리지에 데이터 저장하기
const saveStorageData = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

// 체크인/체크아웃 기록
let checkInOutHistory = getStorageData('checkInOutHistory', {});
let leaveRequests = getStorageData('leaveRequests', []);

// ==================== 초기화 ==================== 

document.addEventListener('DOMContentLoaded', () => {
  initializeApp();
});

function initializeApp() {
  // 현재 연도 설정
  document.getElementById('currentYear').textContent = new Date().getFullYear();
  
  // 시간 업데이트
  updateTime();
  setInterval(updateTime, 1000);
  
  // 메뉴 토글
  setupMenuToggle();
  
  // 출퇴근 버튼 이벤트
  setupCheckInOutEvents();
  
  // 휴가 신청 폼
  setupLeaveForm();
  
  // 로그아웃 버튼
  setupLogoutButton();
  
  // 데이터 업데이트
  updateDashboard();
  updateCheckinHistory();
}

// ==================== 시간 표시 ==================== 

function updateTime() {
  const now = new Date();
  
  // 현재 시간
  const timeStr = now.toLocaleTimeString('ko-KR', { 
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit' 
  });
  
  // 현재 날짜
  const dateStr = now.toLocaleDateString('ko-KR', { 
    year: 'numeric', 
    month: '2-digit', 
    day: '2-digit' 
  }).replace(/\./g, '년 ').replace('년 ', '년 ').replace(/(\d+)년 (\d+) /, '$1년 $2월 ') + '일';
  
  document.getElementById('currentTime').textContent = timeStr;
  document.getElementById('currentDate').textContent = dateStr;
}

// ==================== 메뉴 토글 ==================== 

function setupMenuToggle() {
  const menuButton = document.getElementById('menuButton');
  const navMenu = document.getElementById('navMenu');
  
  menuButton.addEventListener('click', () => {
    const isExpanded = menuButton.getAttribute('aria-expanded') === 'true';
    menuButton.setAttribute('aria-expanded', !isExpanded);
    
    if (!isExpanded) {
      navMenu.style.display = 'flex';
      navMenu.style.flexDirection = 'column';
      navMenu.style.position = 'absolute';
      navMenu.style.top = '100%';
      navMenu.style.left = '0';
      navMenu.style.right = '0';
      navMenu.style.backgroundColor = 'white';
      navMenu.style.borderBottom = '1px solid #e5e7eb';
      navMenu.style.padding = '1rem';
      navMenu.style.gap = '0.5rem';
    } else {
      navMenu.style.display = 'none';
    }
  });
  
  // 네비게이션 링크 클릭 시 메뉴 닫기
  navMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      menuButton.setAttribute('aria-expanded', 'false');
      navMenu.style.display = 'none';
    });
  });
}

// ==================== 출퇴근 기능 ==================== 

function setupCheckInOutEvents() {
  const checkinBtn = document.getElementById('checkinBtn');
  const checkoutBtn = document.getElementById('checkoutBtn');
  const checkinLargeBtn = document.getElementById('checkinLargeBtn');
  const checkoutLargeBtn = document.getElementById('checkoutLargeBtn');
  
  // 대시보드 버튼
  if (checkinBtn) checkinBtn.addEventListener('click', handleCheckIn);
  if (checkoutBtn) checkoutBtn.addEventListener('click', handleCheckOut);
  
  // 출퇴근 페이지 버튼
  if (checkinLargeBtn) checkinLargeBtn.addEventListener('click', handleCheckIn);
  if (checkoutLargeBtn) checkoutLargeBtn.addEventListener('click', handleCheckOut);
  
  // 초기 상태 업데이트
  updateCheckInOutButtons();
}

function handleCheckIn() {
  const today = new Date().toISOString().split('T')[0];
  
  if (!checkInOutHistory[today]) {
    checkInOutHistory[today] = {};
  }
  
  if (!checkInOutHistory[today].checkin) {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('ko-KR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    
    checkInOutHistory[today].checkin = timeStr;
    saveStorageData('checkInOutHistory', checkInOutHistory);
    
    showModal('확인', '출근이 기록되었습니다.');
    updateDashboard();
    updateCheckinHistory();
    updateCheckInOutButtons();
  }
}

function handleCheckOut() {
  const today = new Date().toISOString().split('T')[0];
  
  if (checkInOutHistory[today] && checkInOutHistory[today].checkin) {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('ko-KR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    
    checkInOutHistory[today].checkout = timeStr;
    saveStorageData('checkInOutHistory', checkInOutHistory);
    
    showModal('확인', '퇴근이 기록되었습니다.');
    updateDashboard();
    updateCheckinHistory();
    updateCheckInOutButtons();
  }
}

function updateCheckInOutButtons() {
  const today = new Date().toISOString().split('T')[0];
  const checkinBtn = document.getElementById('checkinBtn');
  const checkoutBtn = document.getElementById('checkoutBtn');
  const checkinLargeBtn = document.getElementById('checkinLargeBtn');
  const checkoutLargeBtn = document.getElementById('checkoutLargeBtn');
  
  if (checkInOutHistory[today] && checkInOutHistory[today].checkin) {
    if (checkinBtn) checkinBtn.disabled = true;
    if (checkinLargeBtn) checkinLargeBtn.disabled = true;
    if (checkoutBtn) checkoutBtn.disabled = false;
    if (checkoutLargeBtn) checkoutLargeBtn.disabled = false;
  } else {
    if (checkinBtn) checkinBtn.disabled = false;
    if (checkinLargeBtn) checkinLargeBtn.disabled = false;
    if (checkoutBtn) checkoutBtn.disabled = true;
    if (checkoutLargeBtn) checkoutLargeBtn.disabled = true;
  }
}

function updateCheckinHistory() {
  const today = new Date().toISOString().split('T')[0];
  const historyList = document.getElementById('todayHistory');
  
  if (!historyList) return;
  
  if (!checkInOutHistory[today]) {
    historyList.innerHTML = '<div class="empty-state">아직 기록이 없습니다.</div>';
    return;
  }
  
  let html = '';
  const record = checkInOutHistory[today];
  
  if (record.checkin) {
    html += `
      <div class="history-item">
        <div class="history-label">출근</div>
        <div class="history-time">${record.checkin}</div>
      </div>
    `;
  }
  
  if (record.checkout) {
    html += `
      <div class="history-item">
        <div class="history-label">퇴근</div>
        <div class="history-time">${record.checkout}</div>
      </div>
    `;
  }
  
  historyList.innerHTML = html;
}

// ==================== 대시보드 업데이트 ==================== 

function updateDashboard() {
  const today = new Date().toISOString().split('T')[0];
  const record = checkInOutHistory[today];
  
  // 오늘의 출퇴근 시간
  if (record && record.checkin) {
    const checkinTimeEl = document.getElementById('checkinTime');
    if (checkinTimeEl) checkinTimeEl.textContent = record.checkin;
  } else {
    const checkinTimeEl = document.getElementById('checkinTime');
    if (checkinTimeEl) checkinTimeEl.textContent = '--:--';
  }
  
  if (record && record.checkout) {
    const checkoutTimeEl = document.getElementById('checkoutTime');
    if (checkoutTimeEl) checkoutTimeEl.textContent = record.checkout;
  } else {
    const checkoutTimeEl = document.getElementById('checkoutTime');
    if (checkoutTimeEl) checkoutTimeEl.textContent = '--:--';
  }
  
  // 근무시간 계산
  if (record && record.checkin && record.checkout) {
    const workingHours = calculateWorkingHours(record.checkin, record.checkout);
    const workingHoursEl = document.getElementById('workingHours');
    if (workingHoursEl) workingHoursEl.textContent = workingHours;
  } else {
    const workingHoursEl = document.getElementById('workingHours');
    if (workingHoursEl) workingHoursEl.textContent = '0:00';
  }
  
  // 이주 근무시간
  updateWeeklyStats();
}

function calculateWorkingHours(checkin, checkout) {
  const [checkinH, checkinM] = checkin.split(':').map(Number);
  const [checkoutH, checkoutM] = checkout.split(':').map(Number);
  
  let hours = checkoutH - checkinH;
  let minutes = checkoutM - checkinM;
  
  if (minutes < 0) {
    hours--;
    minutes += 60;
  }
  
  return `${hours}:${minutes.toString().padStart(2, '0')}`;
}

function updateWeeklyStats() {
  let totalMinutes = 0;
  const today = new Date();
  
  // 이번 주 월요일부터 오늘까지
  const monday = new Date(today);
  monday.setDate(today.getDate() - today.getDay() + 1);
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];
    
    if (date > today) break;
    
    const record = checkInOutHistory[dateStr];
    if (record && record.checkin && record.checkout) {
      const [h, m] = calculateWorkingHours(record.checkin, record.checkout).split(':');
      totalMinutes += parseInt(h) * 60 + parseInt(m);
    }
  }
  
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  
  const weeklyTotalEl = document.getElementById('weeklyTotal');
  if (weeklyTotalEl) weeklyTotalEl.textContent = `${hours}:${minutes.toString().padStart(2, '0')}`;
  
  // 진행률 계산 (40시간 기준)
  const percentage = Math.min((totalMinutes / (40 * 60)) * 100, 100);
  const weeklyProgressEl = document.getElementById('weeklyProgress');
  if (weeklyProgressEl) weeklyProgressEl.style.width = percentage + '%';
}

// ==================== 휴가 신청 ==================== 

function setupLeaveForm() {
  const leaveForm = document.getElementById('leaveForm');
  
  if (!leaveForm) return;
  
  leaveForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const leaveType = document.getElementById('leaveType').value;
    const startDate = document.getElementById('leaveStartDate').value;
    const endDate = document.getElementById('leaveEndDate').value;
    const reason = document.getElementById('leaveReason').value;
    
    if (!leaveType || !startDate || !endDate) {
      showModal('오류', '필수 항목을 모두 입력해주세요.');
      return;
    }
    
    const leaveRequest = {
      id: Date.now(),
      type: leaveType,
      startDate,
      endDate,
      reason,
      status: '승인됨',
      appliedDate: new Date().toLocaleDateString('ko-KR')
    };
    
    leaveRequests.push(leaveRequest);
    saveStorageData('leaveRequests', leaveRequests);
    
    showModal('확인', '휴가가 신청되었습니다.');
    leaveForm.reset();
    updateLeaveList();
  });
  
  updateLeaveList();
}

function updateLeaveList() {
  const leaveItems = document.getElementById('leaveItems');
  
  if (!leaveItems) return;
  
  if (leaveRequests.length === 0) {
    leaveItems.innerHTML = '<div class="empty-state">신청 내역이 없습니다.</div>';
    return;
  }
  
  const leaveTypeNames = {
    annual: '연차',
    monthly: '월차',
    sick: '병가',
    unpaid: '무급휴가'
  };
  
  let html = leaveRequests.map(request => `
    <div class="leave-item-card">
      <div class="leave-item-header">
        <div class="leave-item-type">${leaveTypeNames[request.type]}</div>
        <div class="leave-item-status">${request.status}</div>
      </div>
      <div class="leave-item-date">${request.startDate} ~ ${request.endDate}</div>
      ${request.reason ? `<div style="font-size: 0.875rem; color: #6b7280; margin-top: 0.5rem;">${request.reason}</div>` : ''}
    </div>
  `).join('');
  
  leaveItems.innerHTML = html;
}

// ==================== 로그아웃 ==================== 

function setupLogoutButton() {
  const logoutBtn = document.getElementById('logoutBtn');
  
  if (!logoutBtn) return;
  
  logoutBtn.addEventListener('click', () => {
    showModal('로그아웃', '로그아웃 하시겠습니까?');
    
    const confirmBtn = document.getElementById('modalConfirm');
    const cancelBtn = document.getElementById('modalCancel');
    
    confirmBtn.onclick = () => {
      localStorage.clear();
      alert('로그아웃되었습니다.');
      location.href = '/';
    };
    
    cancelBtn.onclick = () => {
      closeModal();
    };
  });
}

// ==================== 모달 ==================== 

function showModal(title, message) {
  const modal = document.getElementById('confirmModal');
  const modalTitle = document.getElementById('modalTitle');
  const modalMessage = document.getElementById('modalMessage');
  
  if (!modal) return;
  
  modalTitle.textContent = title;
  modalMessage.textContent = message;
  modal.classList.add('active');
  
  // 기본 확인/취소 버튼 동작
  const confirmBtn = document.getElementById('modalConfirm');
  const cancelBtn = document.getElementById('modalCancel');
  
  confirmBtn.onclick = () => {
    closeModal();
  };
  
  cancelBtn.onclick = () => {
    closeModal();
  };
  
  // 바깥쪽 클릭으로 닫기
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });
}

function closeModal() {
  const modal = document.getElementById('confirmModal');
  if (modal) modal.classList.remove('active');
}

// ==================== 유틸리티 함수 ==================== 

// 포맷된 날짜 (YYYY-MM-DD 형식)
function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// 요일 이름
function getDayName(date) {
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  return days[date.getDay()];
}

// 시간 차이 계산 (분 단위)
function calculateTimeDifference(time1, time2) {
  const [h1, m1] = time1.split(':').map(Number);
  const [h2, m2] = time2.split(':').map(Number);
  
  return (h2 * 60 + m2) - (h1 * 60 + m1);
}

// ==================== 근무기록 테이블 ==================== 

function initializeTimesheet() {
  const monthPicker = document.getElementById('monthPicker');
  const timesheetBody = document.getElementById('timesheetBody');
  
  if (!monthPicker || !timesheetBody) return;
  
  // 현재 월 설정
  const today = new Date();
  monthPicker.value = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  
  // 월 변경 시 테이블 업데이트
  monthPicker.addEventListener('change', updateTimesheetTable);
  
  // 초기 로드
  updateTimesheetTable();
}

function updateTimesheetTable() {
  const monthPicker = document.getElementById('monthPicker');
  const timesheetBody = document.getElementById('timesheetBody');
  
  if (!monthPicker || !timesheetBody) return;
  
  const [year, month] = monthPicker.value.split('-').map(Number);
  
  // 해당 월의 일 수
  const daysInMonth = new Date(year, month, 0).getDate();
  
  let html = '';
  
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month - 1, day);
    const dateStr = formatDate(date);
    const dayName = getDayName(date);
    
    const record = checkInOutHistory[dateStr] || {};
    const checkin = record.checkin || '-';
    const checkout = record.checkout || '-';
    
    let workingHours = '-';
    let status = '휴무';
    
    if (record.checkin && record.checkout) {
      workingHours = calculateWorkingHours(record.checkin, record.checkout);
      const minutes = calculateTimeDifference(record.checkin, record.checkout);
      
      if (minutes > 9 * 60) { // 9시간 초과
        status = '정상';
      } else if (minutes > 8 * 60 + 30) { // 8.5시간 초과
        status = '정상';
      } else {
        status = '조기퇴근';
      }
    } else if (record.checkin && !record.checkout) {
      status = '근무중';
    }
    
    const statusClass = status === '정상' ? 'normal' : status === '조기퇴근' ? 'late' : 'absent';
    
    html += `
      <tr>
        <td>${month}/${day}</td>
        <td>${dayName}</td>
        <td>${checkin}</td>
        <td>${checkout}</td>
        <td>${workingHours}</td>
        <td><span class="status-badge ${statusClass}">${status}</span></td>
        <td>-</td>
      </tr>
    `;
  }
  
  timesheetBody.innerHTML = html;
}

// 페이지 로드 시 근무기록 초기화
if (document.getElementById('timesheetBody')) {
  setTimeout(initializeTimesheet, 100);
}

// ==================== Export 함수 ==================== 

// Excel 다운로드 기능 (CSV 형식)
const exportBtn = document.getElementById('exportBtn');
if (exportBtn) {
  exportBtn.addEventListener('click', () => {
    const monthPicker = document.getElementById('monthPicker');
    const [year, month] = monthPicker.value.split('-').map(Number);
    
    let csv = 'Date,Day,Checkin,Checkout,Working Hours,Status\n';
    
    const daysInMonth = new Date(year, month, 0).getDate();
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month - 1, day);
      const dateStr = formatDate(date);
      const dayName = getDayName(date);
      
      const record = checkInOutHistory[dateStr] || {};
      const checkin = record.checkin || '-';
      const checkout = record.checkout || '-';
      
      let workingHours = '-';
      let status = '휴무';
      
      if (record.checkin && record.checkout) {
        workingHours = calculateWorkingHours(record.checkin, record.checkout);
        status = '정상';
      } else if (record.checkin && !record.checkout) {
        status = '근무중';
      }
      
      csv += `${month}/${day},${dayName},${checkin},${checkout},${workingHours},${status}\n`;
    }
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `timesheet_${year}${String(month).padStart(2, '0')}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });
}

console.log('근무시간 관리 시스템이 로드되었습니다.');
