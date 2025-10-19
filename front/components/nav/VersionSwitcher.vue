<script setup lang="ts">
import { ref } from 'vue'
import { Check, ChevronsUpDown, GalleryVerticalEnd } from 'lucide-vue-next'

const props = defineProps<{
  versions: string[]
  defaultVersion: string
}>()

const selectedVersion = ref(props.defaultVersion)
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <button class="flex items-center gap-2 px-3 py-2 rounded bg-muted">
        <GalleryVerticalEnd class="size-4" />
        <span class="font-semibold">Documentation</span>
        <span>v{{ selectedVersion }}</span>
        <ChevronsUpDown class="ml-auto" />
      </button>
    </DropdownMenuTrigger>
    <DropdownMenuContent>
      <DropdownMenuItem
        v-for="version in props.versions"
        :key="version"
        @click="selectedVersion = version"
        class="flex items-center gap-2 cursor-pointer px-2 py-1"
      >
        v{{ version }}
        <Check v-if="selectedVersion === version" class="ml-auto" />
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>