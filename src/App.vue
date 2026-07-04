<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';

const isOpened = ref(false);
const submitted = ref(false);
const now = ref(new Date());
let timerId;

const weddingDate = new Date('2026-09-19T16:00:00+03:00');

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
});

onUnmounted(() => {
  window.clearInterval(timerId);
  document.body.classList.remove('scroll-locked');
});

watch(
  isOpened,
  (opened) => {
    document.body.classList.toggle('scroll-locked', !opened);
  },
  { immediate: true },
);

function submitRsvp() {
  submitted.value = true;
}
</script>

<template>
  <main class="site">
    <section class="envelope-screen" :class="{ 'is-opened': isOpened }">
      <button class="envelope" type="button" @click="isOpened = true" aria-label="Открыть приглашение">
        <span class="envelope__shade" />
        <span class="envelope__content">
          <span>Вы приглашены</span>
          <strong>на свадьбу</strong>
        </span>
        <span class="seal">Нажмите</span>
      </button>
      <p class="intro-note">Вы не просто так получили это приглашение. В особенный день мы очень хотим, чтобы вы были рядом.</p>
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
      <a class="button" href="https://yandex.ru/maps/-/CTa-rE9R" target="_blank" rel="noreferrer">
        Открыть Яндекс Карту
      </a>
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

        <button class="button" type="submit">Отправить</button>
        <p v-if="submitted" class="success">Спасибо! Ответ сохранен на странице. Подключение отправки сделаем следующим шагом.</p>
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
