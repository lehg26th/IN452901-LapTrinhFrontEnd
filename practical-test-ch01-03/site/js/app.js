const API_URL = 'http://localhost:4000';

const formatDateTime = (iso) =>
  new Date(iso).toLocaleString('vi-VN', {
    timeZone: 'Asia/Ho_Chi_Minh',
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

const formatSeats = (event) => {
  const remaining = (event?.capacity ?? 0) - (event?.registeredCount ?? 0);
  if (remaining <= 0) {
    return 'Hết chỗ';
  }
  return `Còn ${remaining}/${event.capacity} chỗ`;
};

const createCardElement = (event) => {
  const card = document.createElement('article');
  card.setAttribute('class', 'event-card');

  const thumbnail = document.createElement('img');
  thumbnail.setAttribute('src', 'img/event.svg');
  thumbnail.setAttribute('alt', event.name ?? 'Hình ảnh sự kiện');
  thumbnail.setAttribute('loading', 'lazy');

  const titleHeading = document.createElement('h3');
  titleHeading.setAttribute('class', 'event-title');

  const titleLink = document.createElement('a');
  titleLink.setAttribute('href', `event-detail.html?id=${encodeURIComponent(event.id)}`);
  titleLink.textContent = event.name ?? '';
  titleHeading.appendChild(titleLink);

  const timeParagraph = document.createElement('p');
  timeParagraph.setAttribute('class', 'event-time');

  const timeElement = document.createElement('time');
  timeElement.setAttribute('datetime', event.startTime);
  timeElement.textContent = formatDateTime(event.startTime);
  timeParagraph.appendChild(timeElement);

  const locationParagraph = document.createElement('p');
  locationParagraph.setAttribute('class', 'event-location');
  locationParagraph.textContent = event.location ?? '';

  const seatsParagraph = document.createElement('p');
  seatsParagraph.setAttribute('class', 'event-seats');

  const seatStatus = formatSeats(event);
  if (seatStatus === 'Hết chỗ') {
    const badge = document.createElement('span');
    badge.setAttribute('class', 'badge');
    badge.textContent = 'Hết chỗ';
    seatsParagraph.appendChild(badge);
  } else {
    seatsParagraph.textContent = seatStatus;
  }

  card.append(thumbnail, titleHeading, timeParagraph, locationParagraph, seatsParagraph);
  return card;
};

const renderEvents = (events) => {
  const container = document.getElementById('event-list');
  if (!container) return;

  const cardNodes = events.map(createCardElement);
  container.replaceChildren(...cardNodes);
};

const loadEvents = async (keyword = '') => {
  const statusElement = document.getElementById('status');
  const eventContainer = document.getElementById('event-list');

  if (statusElement) {
    statusElement.dataset.state = 'loading';
    statusElement.textContent = 'Đang tải…';
  }

  const searchParams = new URLSearchParams();
  searchParams.set('pageSize', '50');

  const cleanKeyword = typeof keyword === 'string' ? keyword.trim() : '';
  if (cleanKeyword !== '') {
    searchParams.set('q', cleanKeyword);
  }

  try {
    const endpoint = `${API_URL}/api/events?${searchParams.toString()}`;
    const response = await fetch(endpoint);

    if (!response.ok) {
      if (statusElement) {
        statusElement.dataset.state = 'error';
        statusElement.textContent = 'Không tải được dữ liệu, vui lòng thử lại.';
      }
      if (eventContainer) {
        eventContainer.replaceChildren();
      }
      return;
    }

    const payload = await response.json();
    const eventItems = Array.isArray(payload.items) ? payload.items : [];

    renderEvents(eventItems);

    if (statusElement) {
      if (eventItems.length === 0) {
        statusElement.dataset.state = 'empty';
        statusElement.textContent = 'Không có sự kiện nào khớp từ khoá.';
      } else {
        statusElement.dataset.state = 'success';
        statusElement.textContent = `Tìm thấy ${eventItems.length} sự kiện`;
      }
    }
  } catch (error) {
    if (statusElement) {
      statusElement.dataset.state = 'error';
      statusElement.textContent = 'Không tải được dữ liệu, vui lòng thử lại.';
    }
    if (eventContainer) {
      eventContainer.replaceChildren();
    }
  }
};

const searchForm = document.getElementById('search-form');
const keywordInput = document.getElementById('keyword');

if (searchForm) {
  searchForm.addEventListener('submit', (evt) => {
    evt.preventDefault();
    const query = keywordInput ? keywordInput.value.trim() : '';
    loadEvents(query);
  });
}

loadEvents();

if (typeof window !== 'undefined') {
  window.formatSeats = formatSeats;
  window.renderEvents = renderEvents;
  window.loadEvents = loadEvents;
}
