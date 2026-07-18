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
let timerId;
let sliderTimerId;

const weddingDate = new Date('2026-09-19T16:00:00+03:00');
const googleSheetsEndpoint = import.meta.env.VITE_GOOGLE_SCRIPT_URL || '';

const rsvp = ref({
  attendance: '',
  name: '',
  guests: '',
  meal: '',
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
  {
    src: '/assets/location/evening-veranda.png',
  },
  {
    src: '/assets/location/glass-veranda-detail.png',
  },
];

const playlist = [
  'Frank Sinatra — Fly Me To The Moon',
  'Elvis Presley — Can’t Help Falling in Love',
  'The Weeknd — Die For You',
  'Мот — Август это ты',
];

const loveStory = [
  {
    title: 'Знакомство',
    text: 'Одна встреча стала началом истории, которую теперь хочется продолжать вместе.',
  },
  {
    title: 'Мы рядом',
    text: 'За это время мы стали друг для друга домом, поддержкой и самым любимым человеком.',
  },
  {
    title: 'Теперь свадьба',
    text: 'Именно поэтому мы зовём вас быть рядом в день, когда начнётся наша семья.',
  },
];

const routeUrl = 'https://yandex.ru/maps/-/CTa-rE9R';

const dressTextures = [
  { name: 'Пудровый атлас', src: '/assets/dress/satin-blush.png' },
  { name: 'Шампань', src: '/assets/dress/satin-champagne.png' },
  { name: 'Бордовый атлас', src: '/assets/dress/satin-burgundy.png' },
  { name: 'Оливковый атлас', src: '/assets/dress/satin-olive.png' },
  { name: 'Коричневый атлас', src: '/assets/dress/satin-brown.png' },
];

const countdown = computed(() => {
  const diff = Math.max(weddingDate.getTime() - now.value.getTime(), 0);
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);

  return { days, hours, minutes, seconds };
});

onMounted(() => {
  timerId = window.setInterval(() => {
    now.value = new Date();
  }, 1000);

  sliderTimerId = window.setInterval(() => {
    activeLocationSlide.value = (activeLocationSlide.value + 1) % locationSlides.length;
  }, 5200);
});

onUnmounted(() => {
  window.clearInterval(timerId);
  window.clearInterval(sliderTimerId);
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

async function submitRsvp() {
  submitted.value = false;
  rsvpError.value = '';
  rsvpSubmitting.value = true;

  try {
    await sendToGoogleSheets('rsvp', {
      attendance: rsvp.value.attendance,
      name: rsvp.value.name,
      guests: rsvp.value.guests,
      meal: rsvp.value.meal,
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
    <section class="envelope-screen" :class="{ 'is-opened': isOpened }">
      <button class="envelope" type="button" @click="isOpened = true" aria-label="Открыть приглашение">
        <span class="envelope__shade" />
        <span class="envelope__content">
          <img class="envelope__wedding" src="/assets/docx/wedding-title-reference.svg" alt="на свадьбу" />
        </span>
        <img class="seal" src="/assets/docx/seal-reference.png" alt="Нажмите" />
      </button>
      <p class="intro-note">
        <span>Вы не просто так получили</span>
        <span>это приглашение.</span>
        <span>В особенный день мы очень хотим,</span>
        <span>чтобы вы были рядом.</span>
      </p>
    </section>

    <section class="hero section" :class="{ 'is-visible': isOpened }">
      <div class="hero__image">
        <img class="hero__photo" src="/assets/couple-hero.png" alt="Иван и Анна" />
        <img class="hero__frame" src="/assets/docx/photo-frame-reference.png" alt="" aria-hidden="true" />
      </div>
      <div class="hero__text">
        <p class="date hero__date">19.09.2026</p>
        <h1 class="hero__names">Иван<br />и Анна</h1>
      </div>
    </section>

    <section class="guests section">
      <h2 class="date-section__title">Дорогие гости!</h2>
      <p class="date-section__text">
        Мы приглашаем вас разделить с нами радостный день, в который мы станем семьёй!
        <br /><br />
        В этот волшебный день мы скажем друг другу «Да» и соединим наши сердца и судьбы в окружении самых близких и родных людей.
      </p>
      <img class="date-section__calendar" src="/assets/docx/date-reference.svg" alt="19 сентября 2026" />
    </section>

    <section class="location section framed">
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
      <p class="timing__quote">
        Жизнь – прекрасное путешествие. Глупо тратить бесценное время на то, что не про любовь
      </p>
      <div class="timeline">
        <img class="timeline__line" src="/assets/timing/timing-line.svg" alt="" aria-hidden="true" />
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

    <section class="details section framed">
      <p class="kicker">Детали</p>
      <h2>Пожелания</h2>
      <p>
        Пожалуйста, не дарите нам цветы, так как мы не успеем насладиться их
        красотой до отъезда в свадебное путешествие. Если вы хотите сделать нам
        комплимент, замените букет бутылочкой вина или цветочной подпиской.
      </p>
      <p>
        Для быстрых вопросов и новостей по свадьбе мы добавим Telegram-чат.
        Ссылку пришлем гостям ближе к дате торжества.
      </p>
    </section>

    <section class="mood section">
      <p class="kicker">Настроение</p>
      <h2>Нам важно ваше настроение</h2>
      <p>
        Приходите красивыми, отдохнувшими и готовыми обниматься, смеяться и
        танцевать. Остальное мы берём на себя.
      </p>
    </section>

    <section class="playlist section">
      <p class="kicker">Музыка вечера</p>
      <h2>Плейлист</h2>
      <div class="playlist__grid">
        <ol>
          <li v-for="track in playlist" :key="track">{{ track }}</li>
        </ol>
        <form class="song-form" @submit.prevent="submitSong">
          <label>
            Предложите песню для вечеринки
            <input v-model="songSuggestion" type="text" placeholder="Название песни или исполнитель" />
          </label>
          <button class="button" type="submit" :disabled="songSubmitting">
            {{ songSubmitting ? 'Отправляем...' : 'Добавить' }}
          </button>
          <p v-if="songSubmitted" class="success">Записали идею: {{ songSuggestion || 'песня-сюрприз' }}.</p>
          <p v-if="songError" class="error">{{ songError }}</p>
        </form>
      </div>
    </section>

    <section class="love-story section">
      <p class="kicker">Love story</p>
      <h2>Коротко о нас</h2>
      <div class="story-grid">
        <article v-for="item in loveStory" :key="item.title">
          <h3>{{ item.title }}</h3>
          <p>{{ item.text }}</p>
        </article>
      </div>
    </section>

    <section class="rsvp section">
      <p class="kicker">Анкета гостя</p>
      <h2>Подтвердите присутствие</h2>
      <p>Пожалуйста, подтвердите своё присутствие до 1 августа.</p>

      <form class="form" @submit.prevent="submitRsvp">
        <fieldset>
          <legend>Планируете ли вы присутствовать на свадьбе?</legend>
          <label><input v-model="rsvp.attendance" type="radio" value="Да, с удовольствием приду!" required /> Да, с удовольствием приду!</label>
          <label><input v-model="rsvp.attendance" type="radio" value="К сожалению, не смогу присутствовать." /> К сожалению, не смогу присутствовать.</label>
        </fieldset>

        <label>Имя и фамилия<input v-model="rsvp.name" type="text" required /></label>
        <label>Если вы будете с семьей, внесите имена гостей<input v-model="rsvp.guests" type="text" /></label>
        <label>Ваш Telegram для связи<input v-model="rsvp.telegram" type="text" placeholder="@username" /></label>

        <fieldset>
          <legend>Какое горячее вы предпочитаете?</legend>
          <label><input v-model="rsvp.meal" type="radio" value="Мясо" /> Мясо</label>
          <label><input v-model="rsvp.meal" type="radio" value="Курица" /> Курица</label>
          <label><input v-model="rsvp.meal" type="radio" value="Рыба" /> Рыба</label>
        </fieldset>

        <fieldset>
          <legend>Какие напитки вы предпочитаете?</legend>
          <label><input v-model="rsvp.drinks" type="checkbox" value="Вино белое" /> Вино белое</label>
          <label><input v-model="rsvp.drinks" type="checkbox" value="Вино красное" /> Вино красное</label>
          <label><input v-model="rsvp.drinks" type="checkbox" value="Шампанское" /> Шампанское</label>
          <label><input v-model="rsvp.drinks" type="checkbox" value="Джин" /> Джин</label>
          <label><input v-model="rsvp.drinks" type="checkbox" value="Крепкий алкоголь" /> Крепкий алкоголь</label>
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
      <p class="kicker">До свадьбы осталось</p>
      <div class="countdown__grid">
        <div><strong>{{ countdown.days }}</strong><span>дней</span></div>
        <div><strong>{{ countdown.hours }}</strong><span>часов</span></div>
        <div><strong>{{ countdown.minutes }}</strong><span>минут</span></div>
        <div><strong>{{ countdown.seconds }}</strong><span>секунд</span></div>
      </div>
      <p class="signature">С любовью, Иван и Анна!</p>
    </section>
  </main>
</template>
