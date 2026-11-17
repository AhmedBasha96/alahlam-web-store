(function () {
  'use strict';

  // Prevent double initialization
  if (window.__pullToRefreshInitialized) return;
  window.__pullToRefreshInitialized = true;

  // Create UI Container
  const ptrWrapper = document.createElement('div');
  ptrWrapper.id = 'mobile-ptr-indicator';
  ptrWrapper.className = 'ptr-indicator-wrapper';
  ptrWrapper.innerHTML = `
    <div class="ptr-pill">
      <div class="ptr-icon-box">
        <svg class="ptr-progress-ring" width="28" height="28" viewBox="0 0 28 28">
          <circle class="ptr-ring-bg" cx="14" cy="14" r="11" />
          <circle class="ptr-ring-fill" cx="14" cy="14" r="11" />
        </svg>
        <div class="ptr-arrow-icon">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <polyline points="19 12 12 19 5 12"></polyline>
          </svg>
        </div>
        <div class="ptr-spinner-icon">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
            <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
          </svg>
        </div>
      </div>
      <div class="ptr-content-text">
        <span class="ptr-text ptr-text-pull">اسحب للتحديث</span>
        <span class="ptr-text ptr-text-release">أفلت لتحديث التطبيق</span>
        <span class="ptr-text ptr-text-loading">جاري التحديث...</span>
      </div>
    </div>
  `;

  // Inject styles
  const style = document.createElement('style');
  style.id = 'mobile-ptr-styles';
  style.textContent = `
    .ptr-indicator-wrapper {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      display: flex;
      justify-content: center;
      align-items: center;
      pointer-events: none;
      z-index: 99999999;
      transform: translateY(-90px);
      transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      direction: rtl;
      font-family: 'Alexandria', 'Cairo', 'Tajawal', -apple-system, BlinkMacSystemFont, sans-serif;
    }

    .ptr-indicator-wrapper.ptr-pulling {
      transition: none;
    }

    .ptr-indicator-wrapper.ptr-refreshing {
      transform: translateY(max(20px, env(safe-area-inset-top, 20px))) !important;
      transition: transform 0.25s ease-out;
    }

    .ptr-pill {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      padding: 7px 16px 7px 12px;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(14px);
      -webkit-backdrop-filter: blur(14px);
      border: 1.5px solid rgba(5, 150, 105, 0.3);
      border-radius: 9999px;
      box-shadow: 0 10px 30px rgba(5, 150, 105, 0.2), 0 4px 12px rgba(0, 0, 0, 0.08);
      color: #0f172a;
      transition: all 0.2s ease;
    }

    [data-theme="dark"] .ptr-pill {
      background: rgba(15, 23, 42, 0.94);
      border-color: rgba(16, 185, 129, 0.3);
      color: #f8fafc;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5), 0 4px 12px rgba(16, 185, 129, 0.15);
    }

    .ptr-icon-box {
      position: relative;
      width: 28px;
      height: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .ptr-progress-ring {
      position: absolute;
      top: 0;
      left: 0;
      transform: rotate(-90deg);
    }

    .ptr-ring-bg {
      fill: none;
      stroke: rgba(5, 150, 105, 0.15);
      stroke-width: 2.5;
    }

    .ptr-ring-fill {
      fill: none;
      stroke: #059669;
      stroke-width: 2.5;
      stroke-linecap: round;
      stroke-dasharray: 69.115; /* 2 * PI * 11 */
      stroke-dashoffset: 69.115;
      transition: stroke-dashoffset 0.05s linear;
    }

    [data-theme="dark"] .ptr-ring-fill {
      stroke: #10b981;
    }

    .ptr-arrow-icon {
      position: absolute;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #059669;
      transition: transform 0.15s ease, opacity 0.15s ease;
    }

    [data-theme="dark"] .ptr-arrow-icon {
      color: #10b981;
    }

    .ptr-spinner-icon {
      position: absolute;
      display: none;
      align-items: center;
      justify-content: center;
      color: #059669;
      animation: ptrSpin 0.75s linear infinite;
    }

    [data-theme="dark"] .ptr-spinner-icon {
      color: #10b981;
    }

    @keyframes ptrSpin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    .ptr-content-text {
      font-size: 0.82rem;
      font-weight: 800;
      line-height: 1;
      white-space: nowrap;
      min-width: 90px;
    }

    .ptr-text {
      display: none;
    }

    .ptr-indicator-wrapper:not(.ptr-ready):not(.ptr-refreshing) .ptr-text-pull {
      display: inline-block;
      color: #475569;
    }
    [data-theme="dark"] .ptr-indicator-wrapper:not(.ptr-ready):not(.ptr-refreshing) .ptr-text-pull {
      color: #94a3b8;
    }

    .ptr-indicator-wrapper.ptr-ready:not(.ptr-refreshing) .ptr-text-release {
      display: inline-block;
      color: #059669;
      font-weight: 900;
      animation: ptrPulse 0.3s ease-out;
    }
    [data-theme="dark"] .ptr-indicator-wrapper.ptr-ready:not(.ptr-refreshing) .ptr-text-release {
      color: #10b981;
    }

    .ptr-indicator-wrapper.ptr-ready:not(.ptr-refreshing) .ptr-pill {
      border-color: #059669;
      box-shadow: 0 12px 35px rgba(5, 150, 105, 0.35);
      transform: scale(1.04);
    }

    .ptr-indicator-wrapper.ptr-refreshing .ptr-text-loading {
      display: inline-block;
      color: #059669;
      font-weight: 900;
    }
    [data-theme="dark"] .ptr-indicator-wrapper.ptr-refreshing .ptr-text-loading {
      color: #10b981;
    }

    .ptr-indicator-wrapper.ptr-refreshing .ptr-arrow-icon {
      display: none;
    }

    .ptr-indicator-wrapper.ptr-refreshing .ptr-ring-fill {
      display: none;
    }

    .ptr-indicator-wrapper.ptr-refreshing .ptr-spinner-icon {
      display: flex;
    }

    @keyframes ptrPulse {
      0% { transform: scale(0.95); }
      50% { transform: scale(1.08); }
      100% { transform: scale(1); }
    }

    /* Smooth spring return for content */
    .ptr-body-pulling {
      transition: transform 0.28s cubic-bezier(0.175, 0.885, 0.32, 1.275) !important;
    }
  `;

  document.head.appendChild(style);
  document.body.appendChild(ptrWrapper);

  // Core Logic Constants
  const RING_CIRCUMFERENCE = 69.115;
  const PULL_THRESHOLD = 70; // px to trigger
  const MAX_PULL = 135; // max indicator travel in px

  let startY = 0;
  let startX = 0;
  let currentY = 0;
  let isPulling = false;
  let isRefreshing = false;
  let hasTriggeredHaptic = false;
  let activeScrollElement = null;

  const ringFill = ptrWrapper.querySelector('.ptr-ring-fill');
  const arrowIcon = ptrWrapper.querySelector('.ptr-arrow-icon');

  function findScrollParent(element) {
    let el = element;
    while (el && el !== document.body && el !== document.documentElement) {
      const style = window.getComputedStyle(el);
      const overflowY = style.overflowY;
      if ((overflowY === 'auto' || overflowY === 'scroll') && el.scrollHeight > el.clientHeight) {
        return el;
      }
      el = el.parentElement;
    }
    return window;
  }

  function getScrollTop(scrollEl) {
    if (!scrollEl || scrollEl === window) {
      return window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;
    }
    return scrollEl.scrollTop || 0;
  }

  function onTouchStart(e) {
    if (isRefreshing) return;

    // Ignore interactive form controls
    const target = e.target;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
      return;
    }

    activeScrollElement = findScrollParent(target);
    const scrollTop = getScrollTop(activeScrollElement);

    if (scrollTop <= 2) {
      const touch = e.touches ? e.touches[0] : e;
      startY = touch.clientY;
      startX = touch.clientX;
      isPulling = false;
      hasTriggeredHaptic = false;
    } else {
      startY = 0;
    }
  }

  function onTouchMove(e) {
    if (isRefreshing || !startY) return;

    const touch = e.touches ? e.touches[0] : e;
    currentY = touch.clientY;
    const currentX = touch.clientX;
    const deltaY = currentY - startY;
    const deltaX = currentX - startX;

    // Cancel if horizontal swipe is dominant (carousel/tabs)
    if (!isPulling && Math.abs(deltaX) > Math.abs(deltaY)) {
      startY = 0;
      return;
    }

    const scrollTop = getScrollTop(activeScrollElement);

    // Only pull down if user is at the top
    if (deltaY > 6 && scrollTop <= 0) {
      isPulling = true;
      ptrWrapper.classList.add('ptr-pulling');

      // Dampened calculation for natural elastic resistance
      const pull = Math.min(MAX_PULL, Math.pow(deltaY, 0.84) * 1.85);
      const progress = Math.min(1, pull / PULL_THRESHOLD);

      // Translate indicator down
      const translateY = -75 + (pull * 0.95);
      ptrWrapper.style.transform = `translateY(${translateY}px)`;

      // Rotate arrow proportionally (0deg -> 180deg)
      if (arrowIcon) {
        const rotation = progress * 180;
        arrowIcon.style.transform = `rotate(${rotation}deg)`;
      }

      // Fill circular progress ring
      if (ringFill) {
        const offset = RING_CIRCUMFERENCE * (1 - progress);
        ringFill.style.strokeDashoffset = offset;
      }

      // Ready state check
      if (pull >= PULL_THRESHOLD) {
        if (!ptrWrapper.classList.contains('ptr-ready')) {
          ptrWrapper.classList.add('ptr-ready');
          if (!hasTriggeredHaptic && navigator.vibrate) {
            try { navigator.vibrate(18); } catch (_) {}
            hasTriggeredHaptic = true;
          }
        }
      } else {
        if (ptrWrapper.classList.contains('ptr-ready')) {
          ptrWrapper.classList.remove('ptr-ready');
          hasTriggeredHaptic = false;
        }
      }

      // Displace content gently for native spring feel
      const frame = document.querySelector('.mobile-frame-container') || document.querySelector('#root');
      if (frame) {
        frame.style.transform = `translateY(${Math.min(32, pull * 0.28)}px)`;
      }

      // Prevent default browser scroll
      if (e.cancelable) {
        e.preventDefault();
      }
    } else if (isPulling && deltaY <= 0) {
      resetIndicator();
    }
  }

  function onTouchEnd() {
    if (!isPulling || isRefreshing) {
      startY = 0;
      return;
    }

    ptrWrapper.classList.remove('ptr-pulling');
    const isReady = ptrWrapper.classList.contains('ptr-ready');

    if (isReady) {
      triggerRefresh();
    } else {
      resetIndicator();
    }

    startY = 0;
    isPulling = false;
  }

  function resetIndicator() {
    ptrWrapper.classList.remove('ptr-ready');
    ptrWrapper.style.transform = 'translateY(-90px)';

    const frame = document.querySelector('.mobile-frame-container') || document.querySelector('#root');
    if (frame) {
      frame.classList.add('ptr-body-pulling');
      frame.style.transform = '';
      setTimeout(() => {
        frame.classList.remove('ptr-body-pulling');
      }, 300);
    }

    if (ringFill) ringFill.style.strokeDashoffset = RING_CIRCUMFERENCE;
    if (arrowIcon) arrowIcon.style.transform = 'rotate(0deg)';
  }

  function triggerRefresh() {
    isRefreshing = true;
    ptrWrapper.classList.add('ptr-refreshing');

    if (navigator.vibrate) {
      try { navigator.vibrate([20, 35]); } catch (_) {}
    }

    // Keep content slightly pushed down during refresh animation
    const frame = document.querySelector('.mobile-frame-container') || document.querySelector('#root');
    if (frame) {
      frame.classList.add('ptr-body-pulling');
      frame.style.transform = 'translateY(22px)';
    }

    // Dispatch custom in-app refresh event so the ACTIVE screen updates in-place without restarting the app!
    try {
      window.dispatchEvent(new CustomEvent('app:pull-to-refresh', {
        detail: { timestamp: Date.now() }
      }));
    } catch (_) {}

    const refreshPromise = (typeof window.__onAppPullToRefresh === 'function')
      ? Promise.resolve(window.__onAppPullToRefresh())
      : Promise.resolve();

    Promise.allSettled([
      refreshPromise,
      new Promise((res) => setTimeout(res, 650))
    ]).then(() => {
      resetIndicator();
      setTimeout(() => {
        isRefreshing = false;
        ptrWrapper.classList.remove('ptr-refreshing');
      }, 300);
    });
  }

  // Attach touch listeners
  window.addEventListener('touchstart', onTouchStart, { passive: true });
  window.addEventListener('touchmove', onTouchMove, { passive: false });
  window.addEventListener('touchend', onTouchEnd, { passive: true });
  window.addEventListener('touchcancel', onTouchEnd, { passive: true });

  // Mouse drag support for desktop testing
  let isMouseDown = false;
  window.addEventListener('mousedown', (e) => {
    if (e.clientY < 200) {
      isMouseDown = true;
      onTouchStart(e);
    }
  });
  window.addEventListener('mousemove', (e) => {
    if (isMouseDown) onTouchMove(e);
  });
  window.addEventListener('mouseup', () => {
    if (isMouseDown) {
      isMouseDown = false;
      onTouchEnd();
    }
  });

})();
