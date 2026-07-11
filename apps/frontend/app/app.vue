<template>
  <UApp>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>

<script setup>
// Важно: используем client-only подход
if (process.client) {
  // Загружаем и инициализируем метрику
  const script = document.createElement('script');
  script.type = 'text/javascript';
  script.innerHTML = `
    (function(m,e,t,r,i,k,a){
      m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
      m[i].l=1*new Date();
      k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)
    })(window, document,'script','https://mc.yandex.ru/metrika/tag.js?id=110447059', 'ym');

    ym(110447059, 'init', {
      ssr: false,
      webvisor: true,
      clickmap: true,
      ecommerce:"dataLayer",
      accurateTrackBounce: true,
      trackLinks: true
    });
  `;
  document.head.appendChild(script);

  // Отслеживание переходов
  const router = useRouter();
  router.afterEach(() => {
    if (window.ym) {
      setTimeout(() => {
        window.ym(110447059, 'hit', window.location.href);
      }, 100);
    }
  });
}
</script>
