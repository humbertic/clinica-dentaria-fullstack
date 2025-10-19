<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useDentes } from '@/composables/useDentes';

// Define face ID as string
type FaceId = string;

const props = defineProps<{
  modelValue?: string[]; // Changed to string array
  denteId?: number;
  multiSelect?: boolean;
  disabled?: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: string[]): void; // Changed to emit string array
}>();

// Use the composable
const { faces, loading, error, fetchFaces, isToothIncisal, getFaceName } = useDentes();

// Fetch faces data when component is mounted
onMounted(async () => {
  if (faces.value.length === 0) {
    await fetchFaces();
  }
});

// Determine if the tooth is incisal
const isIncisal = computed(() => {
  if (!props.denteId) return false;
  return isToothIncisal(props.denteId);
});

// Selected faces as an array
const selectedFaces = computed({
  get: () => props.modelValue || [],
  set: (value) => emit('update:modelValue', value)
});

// Check if a face is selected
const isSelected = (face: FaceId): boolean => {
  return selectedFaces.value.includes(face);
};

// Toggle face selection
const toggleFace = (face: FaceId): void => {
  if (props.disabled) return;
  
  if (props.multiSelect) {
    // Multi-select mode
    if (isSelected(face)) {
      // Remove face if already selected
      selectedFaces.value = selectedFaces.value.filter(f => f !== face);
    } else {
      // Add face to selection
      selectedFaces.value = [...selectedFaces.value, face];
    }
  } else {
    // Single-select mode
    if (isSelected(face)) {
      selectedFaces.value = []; // Clear selection
    } else {
      selectedFaces.value = [face]; // Select only this face
    }
  }
};
</script>

<template>
  <div class="w-full max-w-[200px] mx-auto">
    <div class="mb-2 font-medium">Selecione a(s) face(s):</div>
    
    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center py-4">
      <div class="animate-spin h-6 w-6 border-3 border-primary border-t-transparent rounded-full"></div>
    </div>
    
    <!-- Error State -->
    <div v-else-if="error" class="p-3 text-sm text-destructive border border-destructive rounded-md">
      {{ error }}
    </div>
    
    <!-- Face Selector -->
    <div v-else class="relative w-[150px] h-[150px] mx-auto">
      <!-- Face buttons remain unchanged, just using the new functions -->
      <Button
        variant="outline"
        size="sm"
        class="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-10 rounded-t-lg rounded-b-none flex items-center justify-center"
        :class="isSelected('V') ? 'bg-primary text-primary-foreground border-primary' : 'hover:bg-accent hover:text-accent-foreground'"
        @click="toggleFace('V')"
        :disabled="disabled"
      >
        V
      </Button>
      
      <!-- Other face buttons remain the same -->
      <!-- ... -->
      
      <!-- Face Mesial (M) -->
      <Button
        variant="outline"
        size="sm"
        class="absolute top-1/2 left-0 -translate-y-1/2 w-10 h-10 rounded-l-lg rounded-r-none flex items-center justify-center"
        :class="isSelected('M') ? 'bg-primary text-primary-foreground border-primary' : 'hover:bg-accent hover:text-accent-foreground'"
        @click="toggleFace('M')"
        :disabled="disabled"
      >
        M
      </Button>
      
      <!-- Face Oclusal/Incisal (O/I) -->
      <Button
        variant="outline"
        size="sm"
        class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[50px] h-[50px] rounded-full flex items-center justify-center"
        :class="isSelected(isIncisal ? 'I' : 'O') ? 'bg-primary text-primary-foreground border-primary' : 'hover:bg-accent hover:text-accent-foreground'"
        @click="toggleFace(isIncisal ? 'I' : 'O')"
        :disabled="disabled"
      >
        {{ isIncisal ? 'I' : 'O' }}
      </Button>
      
      <!-- Face Distal (D) -->
      <Button
        variant="outline"
        size="sm"
        class="absolute top-1/2 right-0 -translate-y-1/2 w-10 h-10 rounded-r-lg rounded-l-none flex items-center justify-center"
        :class="isSelected('D') ? 'bg-primary text-primary-foreground border-primary' : 'hover:bg-accent hover:text-accent-foreground'"
        @click="toggleFace('D')"
        :disabled="disabled"
      >
        D
      </Button>
      
      <!-- Face Lingual/Palatina (L) -->
      <Button
        variant="outline"
        size="sm"
        class="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-10 rounded-b-lg rounded-t-none flex items-center justify-center"
        :class="isSelected('L') ? 'bg-primary text-primary-foreground border-primary' : 'hover:bg-accent hover:text-accent-foreground'"
        @click="toggleFace('L')"
        :disabled="disabled"
      >
        L
      </Button>
    </div>
    
    <!-- Selected Faces - Updated to iterate through array -->
    <div v-if="selectedFaces.length > 0" class="mt-4 flex flex-wrap gap-2">
      <Badge 
        v-for="face in selectedFaces" 
        :key="face"
        variant="default"
        class="text-xs"
      >
        {{ getFaceName(face) }}
      </Badge>
    </div>
  </div>
</template>