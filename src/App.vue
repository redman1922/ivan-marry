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
  { time: '16:00', title: 'Сбор гостей' },
  { time: '17:00', title: 'Церемония' },
  { time: '18:00', title: 'Банкет' },
  { time: '22:00', title: 'Торт' },
  { time: '23:00', title: 'Окончание вечера' },
];

const locationSlides = [
  {
    src: '/assets/location/glass-veranda.png',
    title: 'Место церемонии',
    caption: 'Стеклянная веранда среди зелени и мягкого дневного света.',
  },
  {
    src: '/assets/location/park-territory.png',
    title: 'Территория',
    caption: 'Спокойная прогулочная зона парк-отеля перед началом вечера.',
  },
  {
    src: '/assets/location/evening-veranda.png',
    title: 'Банкет',
    caption: 'Вечерний свет, свечи и тёплая атмосфера праздника.',
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

const yandexMapSrc = 'https://yandex.ru/map-widget/v1/?text=%D0%BF%D0%B0%D1%80%D0%BA-%D0%BE%D1%82%D0%B5%D0%BB%D1%8C%20%D0%91%D0%B0%D0%B1%D0%B8%D0%BD%20%D0%B4%D0%B2%D0%BE%D1%80%20%D0%92%D0%B0%D1%81%D1%8E%D0%BA%D0%BE%D0%B2%D0%BE&z=13';
const routeUrl = 'https://yandex.ru/maps/-/CTa-rE9R';

const dressColors = [
  { name: 'Бордовый', value: '#6f1725' },
  { name: 'Зеленый', value: '#233318' },
  { name: 'Оливковый', value: '#687442' },
  { name: 'Бежевый', value: '#d8c3a5' },
  { name: 'Коричневый', value: '#5a3929' },
  { name: 'Нежно-розовый', value: '#e9c8c8' },
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

function setLocationSlide(index) {
  activeLocationSlide.value = index;
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

    <section class="guests section">
      <p class="kicker">Дорогие гости</p>
      <h2>Мы ждём вас</h2>
      <p>
        Скоро наступит очень важный для нас день. Мы очень хотим сделать его
        особенным и приглашаем вас разделить с нами торжество, посвящённое дню
        нашей свадьбы.
      </p>
    </section>

    <section class="hero section" :class="{ 'is-visible': isOpened }">
      <div class="hero__image">
        <img src="/assets/couple-hero.png" alt="Иван и Анна" />
      </div>
      <div class="hero__text">
        <p class="kicker">С любовью приглашаем</p>
        <h1>Иван<br />и Анна</h1>
        <p class="date">19.09.2026</p>
        <p>19 сентября 2026</p>
      </div>
    </section>

    <section class="date-section section">
      <p class="kicker">Наш сентябрь</p>
      <h2>19 сентября 2026</h2>
      <p>
        Скоро наступит очень важный для нас день. Мы будем счастливы разделить
        с вами начало нашей семейной истории.
      </p>
    </section>

    <section class="location section framed">
      <p class="kicker">Локация</p>
      <h2>Стеклянная веранда</h2>
      <p>на территории парк-отеля «Бабин двор»</p>
      <p>Московская область, городской округ Солнечногорск, деревня Васюково</p>
      <a class="button" :href="routeUrl" target="_blank" rel="noreferrer">
        Открыть Яндекс Карту
      </a>
    </section>

    <section class="venue-guide section">
      <div class="venue-slider" aria-label="Фото локации">
        <div class="venue-slider__media">
          <img
            v-for="(slide, index) in locationSlides"
            :key="slide.src"
            :class="{ 'is-active': activeLocationSlide === index }"
            :src="slide.src"
            :alt="slide.title"
          />
        </div>
        <div class="venue-slider__copy">
          <p class="kicker">Бабин двор</p>
          <h2>{{ locationSlides[activeLocationSlide].title }}</h2>
          <p>{{ locationSlides[activeLocationSlide].caption }}</p>
          <div class="slider-dots" aria-label="Переключить фото">
            <button
              v-for="(slide, index) in locationSlides"
              :key="slide.title"
              :class="{ 'is-active': activeLocationSlide === index }"
              type="button"
              @click="setLocationSlide(index)"
            >
              {{ index + 1 }}
            </button>
          </div>
        </div>
      </div>

      <div class="map-grid">
        <div class="map-card">
          <iframe
            :src="yandexMapSrc"
            title="Парк-отель Бабин двор на Яндекс Картах"
            loading="lazy"
            allowfullscreen
          />
        </div>
        <div class="directions">
          <p class="kicker">Как добраться</p>
          <h3>Маршрут без лишних поисков</h3>
          <ul>
            <li><strong>На машине:</strong> откройте точку на Яндекс Картах и постройте маршрут.</li>
            <li><strong>На такси:</strong> покажите водителю парк-отель «Бабин двор», деревня Васюково.</li>
            <li><strong>Парковка:</strong> ориентируйтесь на парковку на территории площадки.</li>
          </ul>
          <a class="button" :href="routeUrl" target="_blank" rel="noreferrer">Построить маршрут</a>
        </div>
      </div>
    </section>

    <section class="timing section">
      <p class="kicker">Тайминг дня</p>
      <h2>План вечера</h2>
      <p class="muted">Тайминг пока ориентировочный, возможно чуть позже мы его уточним.</p>
      <div class="timeline">
        <span class="timeline__heart">♥</span>
        <div v-for="item in timing" :key="item.time" class="timeline__item">
          <strong>{{ item.time }}</strong>
          <i />
          <span>{{ item.title }}</span>
        </div>
      </div>
    </section>

    <section class="dress section">
      <p class="kicker">Dress code</p>
      <h2>Цветовая гамма</h2>
      <p>
        Мы будем вам признательны, если вы поддержите цветовую гамму торжества
        в одежде.
      </p>
      <div class="palette">
        <figure v-for="color in dressColors" :key="color.name">
          <span :style="{ backgroundColor: color.value }" />
          <figcaption>{{ color.name }}</figcaption>
        </figure>
      </div>
      <img class="dress__reference" src="/assets/docx/dress-code-reference.png" alt="Референс дресс-кода" />
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
