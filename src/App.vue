<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';

const isOpened = ref(false);
const submitted = ref(false);
const now = ref(new Date());
const activeLocationSlide = ref(0);
const songSuggestion = ref('');
const songSubmitted = ref(false);
const rsvpSubmitting = ref(false);
const rsvpError = ref('');
const songSubmitting = ref(false);
const songError = ref('');
const bgAudio = ref(null);
const timelineEl = ref(null);
const timelinePath = ref(null);
const heartProgress = ref(0);
let timerId;
let sliderTimerId;
let scrollRafId = 0;

const weddingDate = new Date('2026-09-19T16:00:00+03:00');
const googleSheetsEndpoint = import.meta.env.VITE_GOOGLE_SCRIPT_URL || '';
const musicSrc = '/assets/audio/lana-del-rey-chemtrails-over-the-country-club.mp3';
const timingLinePath = 'M28 18 C302 143 332 302 286 470 C232 665 22 683 18 909 C14 1131 306 1151 304 1384 C302 1624 18 1633 18 1868 C18 2069 228 2074 300 2110';

const rsvp = ref({
  attendance: '',
  name: '',
  overnight: '',
  drinks: [],
  telegram: '',
});

const timing = [
  { time: '16:00', title: 'Сбор гостей', icon: '/assets/timing/guests.svg' },
  { time: '17:00', title: 'Церемония', icon: '/assets/timing/ceremony.svg' },
  { time: '18:00', title: 'Банкет', icon: '/assets/timing/banquet.svg' },
  { time: '22:00', title: 'Торт', icon: '/assets/timing/cake.svg' },
  { time: '23:00', title: 'Окончание вечера', icon: '/assets/timing/finish.svg' },
];

const locationSlides = [
  {
    src: '/assets/location/glass-veranda.png',
  },
  {
    src: '/assets/location/park-territory.png',
  },
];

const routeUrl = 'https://yandex.ru/maps/-/CTa-rE9R';

const dressTextures = [
  { name: 'Бордовый атлас', src: '/assets/dress/satin-burgundy.png' },
  { name: 'Оливковый атлас', src: '/assets/dress/satin-olive.png' },
  { name: 'Коричневый атлас', src: '/assets/dress/satin-brown.png' },
  { name: 'Шампань', src: '/assets/dress/satin-champagne.png' },
  { name: 'Пудровый атлас', src: '/assets/dress/satin-blush.png' },
];

const wishItems = [
  {
    title: 'Конверты',
    icon: '/assets/wishes/envelope.svg',
    text: 'Ваши улыбки и смех подарят нам незабываемое счастье в этот день, а пожелания в конвертах помогут осуществить наши мечты!',
  },
  {
    title: 'Цветочек',
    icon: '/assets/wishes/flower.svg',
    text: 'Пожалуйста, не дарите нам цветы, так как мы не успеем насладиться их красотой до отъезда в свадебное путешествие. Если вы хотите сделать нам комплимент, замените букет бутылочкой вина или цветочной подпиской.',
  },
  {
    title: 'Детки',
    icon: '/assets/wishes/kids.svg',
    text: 'Мы от всего сердца хотим, чтобы вы смогли расслабиться и насладиться каждым мгновением нашего праздника. Заранее благодарим за то, что позаботитесь о присмотре за вашими чудесными детками!',
  },
  {
    title: 'Горько',
    icon: '/assets/wishes/gorko.svg',
    text: 'От всего сердца просим вас воздержаться от криков «Горько!» и сохранить атмосферу уютного семейного праздника.',
  },
];

const countdown = computed(() => {
  const diff = Math.max(weddingDate.getTime() - now.value.getTime(), 0);
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);

  return { days, hours, minutes, seconds };
});

const timelineHeartStyle = computed(() => {
  const progress = heartProgress.value;
  const path = timelinePath.value;
  const timeline = timelineEl.value;
  const rotate = -10 + progress * 18;
  const scale = .92 + Math.sin(progress * Math.PI) * .13;

  if (!path || !timeline) {
    return {
      transform: `translate(-50%, 0) rotate(${rotate.toFixed(1)}deg) scale(${scale.toFixed(2)})`,
    };
  }

  const length = path.getTotalLength();
  const point = path.getPointAtLength(length * progress);
  const svgRect = path.ownerSVGElement.getBoundingClientRect();
  const timelineRect = timeline.getBoundingClientRect();
  const x = svgRect.left - timelineRect.left + (point.x / 321) * svgRect.width;
  const y = svgRect.top - timelineRect.top + (point.y / 2245) * svgRect.height;

  return {
    transform: `translate(calc(${x.toFixed(1)}px - 50%), calc(${y.toFixed(1)}px - 50%)) rotate(${rotate.toFixed(1)}deg) scale(${scale.toFixed(2)})`,
  };
});

function updateHeartProgress() {
  scrollRafId = 0;

  if (!timelineEl.value) {
    return;
  }

  const rect = timelineEl.value.getBoundingClientRect();
  const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
  const start = viewportHeight * .68;
  const travel = Math.max(rect.height - viewportHeight * .18, 1);
  const nextProgress = Math.min(Math.max((start - rect.top) / travel, 0), 1);

  heartProgress.value = nextProgress;
}

function requestHeartUpdate() {
  if (scrollRafId) {
    return;
  }

  scrollRafId = window.requestAnimationFrame(updateHeartProgress);
}

onMounted(() => {
  timerId = window.setInterval(() => {
    now.value = new Date();
  }, 1000);

  sliderTimerId = window.setInterval(() => {
    activeLocationSlide.value = (activeLocationSlide.value + 1) % locationSlides.length;
  }, 5200);

  updateHeartProgress();
  window.addEventListener('scroll', requestHeartUpdate, { passive: true });
  window.addEventListener('resize', requestHeartUpdate);
});

onUnmounted(() => {
  window.clearInterval(timerId);
  window.clearInterval(sliderTimerId);
  if (scrollRafId) {
    window.cancelAnimationFrame(scrollRafId);
  }
  window.removeEventListener('scroll', requestHeartUpdate);
  window.removeEventListener('resize', requestHeartUpdate);
  bgAudio.value?.pause();
  document.body.classList.remove('scroll-locked');
});

watch(
  isOpened,
  (opened) => {
    document.body.classList.toggle('scroll-locked', !opened);
  },
  { immediate: true },
);

async function sendToGoogleSheets(type, payload) {
  if (!googleSheetsEndpoint) {
    throw new Error('Не указан VITE_GOOGLE_SCRIPT_URL в .env');
  }

  await fetch(googleSheetsEndpoint, {
    method: 'POST',
    mode: 'no-cors',
    headers: {
      'Content-Type': 'text/plain;charset=utf-8',
    },
    body: JSON.stringify({
      type,
      payload,
      sentAt: new Date().toISOString(),
    }),
  });
}

async function playMusic() {
  if (!bgAudio.value) {
    return;
  }

  bgAudio.value.volume = 0.4;

  try {
    await bgAudio.value.play();
  } catch {
    // Browser may block audio if the click is not treated as a direct user gesture.
  }
}

async function openInvitation() {
  isOpened.value = true;
  await playMusic();
}

async function submitRsvp() {
  submitted.value = false;
  rsvpError.value = '';
  rsvpSubmitting.value = true;

  try {
    await sendToGoogleSheets('rsvp', {
      attendance: rsvp.value.attendance,
      name: rsvp.value.name,
      overnight: rsvp.value.overnight,
      drinks: [...rsvp.value.drinks],
      telegram: rsvp.value.telegram,
    });
    submitted.value = true;
  } catch (error) {
    rsvpError.value = error instanceof Error ? error.message : 'Не удалось отправить ответ';
  } finally {
    rsvpSubmitting.value = false;
  }
}

function showNextLocationSlide() {
  activeLocationSlide.value = (activeLocationSlide.value + 1) % locationSlides.length;
}

async function submitSong() {
  songSubmitted.value = false;
  songError.value = '';
  songSubmitting.value = true;

  try {
    await sendToGoogleSheets('song', {
      song: songSuggestion.value,
    });
    songSubmitted.value = true;
  } catch (error) {
    songError.value = error instanceof Error ? error.message : 'Не удалось отправить песню';
  } finally {
    songSubmitting.value = false;
  }
}
</script>

<template>
  <main class="site">
    <audio ref="bgAudio" preload="auto" loop>
      <source :src="musicSrc" type="audio/mpeg" />
    </audio>

    <section class="envelope-screen" :class="{ 'is-opened': isOpened }">
      <button class="envelope" type="button" @click="openInvitation" aria-label="Открыть приглашение">
        <span class="envelope__shade" />
        <span class="envelope__content">
          <img class="envelope__wedding" src="/assets/docx/wedding-title-reference.svg" alt="на свадьбу" />
        </span>
        <img class="seal" src="/assets/docx/seal-reference.png" alt="Нажмите" />
      </button>
      <p class="intro-note">
        Вы не просто так получили это приглашение! В особенный день мы очень хотим, чтобы вы были рядом!
      </p>
    </section>

    <section class="hero section" :class="{ 'is-visible': isOpened }">
      <div class="hero__image">
        <img class="hero__photo" src="/assets/first.png" alt="Иван и Анна" />
      </div>
      <div class="hero__text">
        <h1 class="hero__names">Иван<br />&<br />Анна</h1>
        <p class="date hero__date">19.09.2026</p>
      </div>
    </section>

    <section class="guests section">
      <h2 class="date-section__title">Дорогие гости!</h2>
      <p class="date-section__text">
        Мы приглашаем вас разделить с нами радостный день, в который мы станем семьёй!
        <br /><br />
        В этот волшебный день мы скажем друг другу «Да» и соединим наши сердца и судьбы в окружении самых близких и родных людей.
      </p>
      <h3 class="date-section__calendar-title">Наш сентябрь</h3>
      <img class="date-section__calendar" src="/assets/docx/date-reference.svg" alt="19 сентября 2026" />
    </section>

    <section class="location section">
      <div class="location__intro">
        <h2 class="location__title">Локация</h2>
      </div>

      <div class="venue-slider" aria-label="Фото локации">
        <button
          class="venue-slider__media"
          type="button"
          aria-label="Показать следующее фото локации"
          @click="showNextLocationSlide"
        >
          <img
            v-for="(slide, index) in locationSlides"
            :key="slide.src"
            :class="{ 'is-active': activeLocationSlide === index }"
            :src="slide.src"
            alt="Фото локации"
          />
        </button>
      </div>

      <div class="location__details">
        <p class="location__venue">Стеклянная веранда</p>
        <p class="location__place">на территории парк-отеля «Бабин двор»</p>
        <p class="location__place">Московская область, городской округ Солнечногорск, деревня Васюково</p>
      </div>

      <a class="button" :href="routeUrl" target="_blank" rel="noreferrer">
        Открыть Яндекс Карту
      </a>
    </section>

    <section class="timing section">
      <h2 class="timing__title">Тайминг дня</h2>
      <div ref="timelineEl" class="timeline">
        <img class="timeline__line" src="/assets/timing/timing-line.svg" alt="" aria-hidden="true" />
        <svg class="timeline__curve" viewBox="0 0 321 2245" preserveAspectRatio="none" aria-hidden="true">
          <path ref="timelinePath" :d="timingLinePath" />
        </svg>
        <span class="timeline__heart" :style="timelineHeartStyle" aria-hidden="true">♥</span>
        <div v-for="item in timing" :key="item.time" class="timeline__item">
          <img class="timeline__icon" :src="item.icon" alt="" aria-hidden="true" />
          <div class="timeline__copy">
            <strong>{{ item.time }}</strong>
            <span>{{ item.title }}</span>
          </div>
        </div>
      </div>
    </section>

    <section class="dress section">
      <h2 class="dress__title">Дресс-код</h2>
      <p class="dress__lead">
        Мы создаем наш свадебный день с особым трепетом. И нам будет очень приятно,
        если вы поддержите цветовую гамму:
      </p>
      <div class="palette" aria-label="Цветовая гамма дресс-кода">
        <figure v-for="texture in dressTextures" :key="texture.name">
          <img :src="texture.src" :alt="texture.name" />
        </figure>
      </div>
      <div class="dress__notes">
        <p>
          <strong>Для дам:</strong>
          вечерние и коктейльные платья в предложенных оттенках. Также это могут быть корсеты, юбки, костюмы.
          Просим избегать белого цвета и ярких неоновых оттенков.
        </p>
        <p>
          <strong>Для джентльменов:</strong>
          классические костюмы черного или любых оттенков коричневого цвета. Смокинги, жилеты, светлые рубашки или поло.
        </p>
      </div>
    </section>

    <section class="details section">
      <h2 class="details__title">Детали</h2>
      <div class="wish-list">
        <article v-for="item in wishItems" :key="item.title" class="wish-item">
          <img class="wish-item__icon" :src="item.icon" alt="" aria-hidden="true" />
          <div>
            <p>{{ item.text }}</p>
          </div>
        </article>
        <article class="wish-item wish-item--song">
          <img class="wish-item__icon" src="/assets/wishes/music.svg" alt="" aria-hidden="true" />
          <div>
            <p>
              Мы будем рады, если вы поделитесь песней, которая точно должна прозвучать на нашем празднике.
            </p>
            <form class="song-form wish-song-form" @submit.prevent="submitSong">
              <label>
                Ваша песня
                <input v-model="songSuggestion" type="text" placeholder="Название песни или исполнитель" />
              </label>
              <button class="button" type="submit" :disabled="songSubmitting">
                {{ songSubmitting ? 'Отправляем...' : 'Добавить песню' }}
              </button>
              <p v-if="songSubmitted" class="success">Записали идею: {{ songSuggestion || 'песня-сюрприз' }}.</p>
              <p v-if="songError" class="error">{{ songError }}</p>
            </form>
          </div>
        </article>
        <article class="wish-item wish-item--stay">
          <img class="wish-item__icon" src="/assets/wishes/house.svg" alt="" aria-hidden="true" />
          <div>
            <p>
              Дорогие гости! Для вашего комфорта мы предусмотрели возможность переночевать в домиках на территории парк-отеля, где будет проходить праздник. Возьмите с собой сменную одежду и купальники, если захотите отдохнуть в бане.
            </p>
          </div>
        </article>
        <article class="wish-item wish-item--telegram">
          <img class="wish-item__icon" src="/assets/wishes/telegram.svg?v=3" alt="" aria-hidden="true" />
          <div>
            <p>
              Мы создали телеграм-чат нашего праздника, где можно будет узнать дополнительную информацию, а также поделиться фотографиями и видео в день свадьбы и после.
            </p>
            <a class="button telegram-button" href="https://t.me/+r9tqcAYtGUAwMTZi" target="_blank" rel="noreferrer">
              Вступить
            </a>
          </div>
        </article>
      </div>
    </section>

    <section class="rsvp section">
      <h2 class="rsvp__title">Анкета гостя</h2>
      <p>Пожалуйста, подтвердите своё присутствие до 15 августа.</p>

      <form class="form" @submit.prevent="submitRsvp">
        <fieldset>
          <legend>Планируете ли вы присутствовать на свадьбе?</legend>
          <label><input v-model="rsvp.attendance" type="radio" value="Да, с удовольствием приду!" required /> Да, с удовольствием приду!</label>
          <label><input v-model="rsvp.attendance" type="radio" value="К сожалению, не смогу присутствовать." /> К сожалению, не смогу присутствовать.</label>
        </fieldset>

        <label>Имя и фамилия<input v-model="rsvp.name" type="text" required /></label>
        <label>Ваш Telegram для связи<input v-model="rsvp.telegram" type="text" placeholder="@username" /></label>

        <fieldset>
          <legend>Будете ли вы оставаться на ночь?</legend>
          <label><input v-model="rsvp.overnight" type="radio" value="Да" /> Да</label>
          <label><input v-model="rsvp.overnight" type="radio" value="Нет" /> Нет</label>
        </fieldset>

        <fieldset>
          <legend>Какие напитки вы предпочитаете?</legend>
          <label><input v-model="rsvp.drinks" type="checkbox" value="Вино белое" /> Вино белое</label>
          <label><input v-model="rsvp.drinks" type="checkbox" value="Вино красное" /> Вино красное</label>
          <label><input v-model="rsvp.drinks" type="checkbox" value="Шампанское" /> Шампанское</label>
          <label><input v-model="rsvp.drinks" type="checkbox" value="Джин" /> Джин</label>
          <label><input v-model="rsvp.drinks" type="checkbox" value="Виски" /> Виски</label>
          <label><input v-model="rsvp.drinks" type="checkbox" value="Водка" /> Водка</label>
          <label><input v-model="rsvp.drinks" type="checkbox" value="Коньяк" /> Коньяк</label>
          <label><input v-model="rsvp.drinks" type="checkbox" value="Безалкогольные напитки" /> Безалкогольные напитки</label>
        </fieldset>

        <button class="button" type="submit" :disabled="rsvpSubmitting">
          {{ rsvpSubmitting ? 'Отправляем...' : 'Отправить' }}
        </button>
        <p v-if="submitted" class="success">Спасибо! Ответ отправлен.</p>
        <p v-if="rsvpError" class="error">{{ rsvpError }}</p>
      </form>
    </section>

    <section class="countdown section">
      <img class="countdown__rings" src="/assets/countdown/rings.svg" alt="" aria-hidden="true" />
      <h2 class="countdown__title">Мы скажем «Да» через</h2>
      <div class="countdown__grid">
        <div><strong>{{ countdown.days }}</strong><span>дней</span></div>
        <div><strong>{{ countdown.hours }}</strong><span>часов</span></div>
        <div><strong>{{ countdown.minutes }}</strong><span>минут</span></div>
        <div><strong>{{ countdown.seconds }}</strong><span>секунд</span></div>
      </div>
      <div class="countdown__photo">
        <img class="countdown__photo-img" src="/assets/end.png" alt="Иван и Анна" />
      </div>
      <p class="signature">
        <span>С любовью,</span>
        <span>Иван и Анна!</span>
      </p>
    </section>
  </main>
</template>
