<template>
  <div class="space-y-4 p-8">
    <!-- Только текст -->
    <Button text="Написать в поддержку" />

    <!-- Иконка слева + текст -->
    <Button
      text="Написать в поддержку"
      icon="i-lucide-message-circle"
    />

    <!-- Иконка справа + текст -->
    <Button
      text="Далее"
      icon="i-lucide-arrow-right"
      icon-position="right"
    />

    <!-- Только иконка (без текста) -->
    <Button
      icon="i-lucide-settings"
      icon-only
      color="secondary"
    />

    <!-- Разные цвета -->
    <Button text="Успех" color="success" />
    <Button text="Ошибка" color="danger" />
    <Button text="Предупреждение" color="warning" />
    <Button text="Вторичная" color="secondary" />
    <Button text="Нейтральная" color="neutral" />

    <!-- Разные варианты -->
    <Button text="Outline" variant="outline" />
    <Button text="Ghost" variant="ghost" />

    <!-- Размеры -->
    <Button text="XS" size="xs" />
    <Button text="SM" size="sm" />
    <Button text="MD" size="md" />
    <Button text="LG" size="lg" />

    <!-- Блок на всю ширину -->
    <Button text="На всю ширину" block />

    <!-- Состояние загрузки -->
    <Button
      text="Сохранить"
      icon="i-lucide-loader-2"
      loading
    />

    <!-- Отключена -->
    <Button text="Отключена" disabled />
    
    <!-- Со слотом для сложного контента -->
    <Button color="success">
      <UIcon name="i-lucide-check" class="h-4 w-4" />
      <span>Готово</span>
      <UIcon name="i-lucide-star" class="h-3 w-3" />
    </Button>
  </div>
</template>
