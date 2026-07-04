<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue';

const pageHost = ref(null);
const loadError = ref('');

const injectedNodes = [];
let originalTitle = '';
let originalBodyClass = '';
let originalBodyStyle = '';

function cloneAttributes(from, to) {
  Array.from(from.attributes).forEach((attribute) => {
    to.setAttribute(attribute.name, attribute.value);
  });
}

function appendHeadNode(node) {
  const cloned = node.cloneNode(true);
  document.head.appendChild(cloned);
  injectedNodes.push(cloned);
}

function runScript(sourceScript) {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    let isResolved = false;

    const finish = () => {
      if (isResolved) {
        return;
      }

      isResolved = true;
      resolve();
    };

    cloneAttributes(sourceScript, script);

    script.onload = finish;
    script.onerror = finish;

    if (sourceScript.src) {
      script.src = sourceScript.src;
      window.setTimeout(finish, 2500);
    } else {
      script.textContent = sourceScript.textContent;
    }

    document.body.appendChild(script);
    injectedNodes.push(script);

    if (!sourceScript.src) {
      finish();
    }
  });
}

async function runScriptsInOrder(scripts) {
  for (const script of scripts) {
    await runScript(script);
  }
}

function revealTildaPage() {
  document.querySelectorAll('.t-records').forEach((records) => {
    records.classList.add('t-records_animated', 't-records_visible');
    records.style.opacity = '1';
  });

  document.querySelectorAll('.nl_reploader_father').forEach((loader) => {
    loader.classList.add('n048-hide', 'display_none');
    loader.classList.remove('n048-show');
    loader.style.display = 'none';
  });
}

async function mountTildaPage() {
  const response = await fetch('/tilda-letter.html');

  if (!response.ok) {
    throw new Error(`Не удалось загрузить оригинальный HTML: ${response.status}`);
  }

  const html = await response.text();
  const parsedPage = new DOMParser().parseFromString(html, 'text/html');
  const headNodes = Array.from(parsedPage.head.children);
  const bodyScripts = Array.from(parsedPage.body.querySelectorAll('script'));

  originalTitle = document.title;
  originalBodyClass = document.body.className;
  originalBodyStyle = document.body.getAttribute('style') || '';

  document.title = parsedPage.title || originalTitle;
  document.body.className = parsedPage.body.className;
  document.body.setAttribute('style', parsedPage.body.getAttribute('style') || '');

  headNodes
    .filter((node) => node.tagName !== 'TITLE' && node.tagName !== 'SCRIPT')
    .forEach(appendHeadNode);

  pageHost.value.innerHTML = parsedPage.body.innerHTML;
  pageHost.value.querySelectorAll('script').forEach((script) => script.remove());
  window.setTimeout(revealTildaPage, 2600);

  const headScripts = headNodes.filter((node) => node.tagName === 'SCRIPT');
  await runScriptsInOrder([...headScripts, ...bodyScripts]);

  document.dispatchEvent(new Event('DOMContentLoaded', { bubbles: true }));
  window.dispatchEvent(new Event('load'));
  revealTildaPage();
}

onMounted(async () => {
  try {
    await mountTildaPage();
  } catch (error) {
    loadError.value = error instanceof Error ? error.message : 'Не удалось загрузить страницу';
  }
});

onBeforeUnmount(() => {
  injectedNodes.forEach((node) => node.remove());
  document.title = originalTitle;
  document.body.className = originalBodyClass;

  if (originalBodyStyle) {
    document.body.setAttribute('style', originalBodyStyle);
  } else {
    document.body.removeAttribute('style');
  }
});
</script>

<template>
  <div ref="pageHost" />
  <div v-if="loadError" class="letter-load-error">{{ loadError }}</div>
</template>
