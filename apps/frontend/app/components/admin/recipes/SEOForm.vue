<template>
  <UFormField label="SEO настройки">
    <div class="space-y-4 p-4 border rounded-lg">
      <div class="space-y-2 flex flex-col">
        <UInput
          :model-value="seo.title"
          placeholder="SEO заголовок (до 60 символов)"
          maxlength="60"
          @update:model-value="updateSeoField('title', $event)"
        />
        <div class="text-xs text-muted-foreground">
          Осталось символов: {{ 60 - (seo.title?.length || 0) }}
        </div>
      </div>

      <div class="space-y-2 flex flex-col">
        <label class="text-sm font-medium">SEO описание</label>
        <UTextarea
          :model-value="seo.description"
          placeholder="SEO описание (до 160 символов)"
          :rows="3"
          maxlength="160"
          @update:model-value="updateSeoField('description', $event)"
        />
        <div class="text-xs text-muted-foreground">
          Осталось символов: {{ 160 - (seo.description?.length || 0) }}
        </div>
      </div>

      <div class="space-y-2 flex flex-col">
        <CustomKeywords
          :model-value="seo.keywords"
          @update:model-value="updateSeoField('keywords', $event)"
        />
      </div>
      
      <!-- Предпросмотр SEO -->
      <div class="mt-4 pt-4 border-t">
        <label class="text-sm font-medium mb-2 block">Предпросмотр в поисковой выдаче</label>
        <div class="p-3 border rounded-lg bg-muted/30 space-y-1">
          <div class="text-sm font-semibold text-primary hover:underline cursor-pointer">
            {{ previewTitle }}
          </div>
          <div class="text-xs text-muted-foreground">
            {{ previewUrl }}
          </div>
          <div class="text-xs text-muted-foreground line-clamp-2">
            {{ previewDescription }}
          </div>
        </div>
      </div>
    </div>
  </UFormField>
</template>

<script setup lang="ts">
import CustomKeywords from './CustomKeywords.vue'

interface Props {
  seo: {
    title: string
    description: string
    keywords: string[]
  }
  title?: string
  srcPath?: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:seo': [value: Props['seo']]
}>()

const keywordItems = computed(() =>
  props.seo.keywords.map(k => ({ label: k, value: k }))
)

const previewTitle = computed(() =>
  props.seo.title || props.title || 'Заголовок страницы'
)

const previewUrl = computed(() =>
  `https://ayeda.ru/recipe/${props.srcPath || '...'}`
)

const previewDescription = computed(() =>
  props.seo.description || 'Описание страницы'
)

const updateSeoField = (field: keyof Props['seo'], value: any) => {
  const newSeo = { ...props.seo, [field]: value }
  emit('update:seo', newSeo)
}
</script>
