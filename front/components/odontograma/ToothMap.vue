<script setup lang="ts">
import { ref, computed } from 'vue';
import { Button } from '@/components/ui/button';
import { useDentes } from '@/composables/useDentes';
import type { Dente } from '@/types/odontograma';


const props = defineProps<{
  modelValue?: number;
  disabled?: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: number): void;
}>();


const { dentes, loading, error, fetchDentes, getDentesByQuadrante } = useDentes();

// Estado local
const selectedTooth = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value ?? 0)
});

const showPermanent = ref(true);
const showDeciduous = ref(false);

// Filtrar dentes por quadrante
// const dentesPorQuadrante = (quadrante: number) => {
//   return dentes
//     .filter(dente => dente.quadrante === quadrante)
//     .sort((a, b) => a.posicao - b.posicao);
// };
onMounted(async () => {
  if (dentes.value.length === 0) {
    await fetchDentes();
  }
});


// Selecionar dente
const selectTooth = (id: number) => {
  if (props.disabled) return;
  selectedTooth.value = id;
};
</script>
<template>
  <div class="w-full  mx-auto space-y-4 ">
    <div class="mb-2 font-medium">Selecione um dente:</div>
    
    <!-- Dentes permanentes -->
    <div v-if="showPermanent" class="grid grid-cols-2 gap-4 relative">
       <!-- Vertical divider line -->
      <div class="absolute inset-y-0 left-1/2 w-0.5 -ml-[0.5px] bg-border"></div>
      <!-- Quadrante 1 (superior direito) -->
      <div class="flex justify-end gap-1">
        <div 
          v-for="dente in getDentesByQuadrante(1).reverse()" 
          :key="dente.id"
          class="w-9 h-9 flex items-center justify-center border rounded-md cursor-pointer transition-colors"
          :class="selectedTooth === dente.id ? 
            'bg-primary text-primary-foreground border-primary' : 
            'border-border hover:bg-accent hover:text-accent-foreground'"
          @click="selectTooth(dente.id)"
        >
          {{ dente.codigo_fdi }}
        </div>
      </div>
      
      <!-- Quadrante 2 (superior esquerdo) -->
      <div class="flex  justify-start gap-1">
        <div 
          v-for="dente in getDentesByQuadrante(2)" 
          :key="dente.id"
          class="w-9 h-9 flex items-center justify-center border rounded-md cursor-pointer transition-colors"
          :class="selectedTooth === dente.id ? 
            'bg-primary text-primary-foreground border-primary' : 
            'border-border hover:bg-accent hover:text-accent-foreground'"
          @click="selectTooth(dente.id)"
        >
          {{ dente.codigo_fdi }}
        </div>
      </div>
      
      <!-- Linha divisória -->
      <div class="col-span-2 h-0.5 my-2 bg-border"></div>
      
      <!-- Quadrante 4 (inferior direito) -->
      <div class="flex  justify-end gap-1">
        <div 
          v-for="dente in getDentesByQuadrante(4).reverse()" 
          :key="dente.id"
          class="w-9 h-9 flex items-center justify-center border rounded-md cursor-pointer transition-colors"
          :class="selectedTooth === dente.id ? 
            'bg-primary text-primary-foreground border-primary' : 
            'border-border hover:bg-accent hover:text-accent-foreground'"
          @click="selectTooth(dente.id)"
        >
          {{ dente.codigo_fdi }}
        </div>
      </div>
      
      <!-- Quadrante 3 (inferior esquerdo) -->
      <div class="flex  justify-start gap-1">
        <div 
          v-for="dente in getDentesByQuadrante(3)" 
          :key="dente.id"
          class="w-9 h-9 flex items-center justify-center border rounded-md cursor-pointer transition-colors"
          :class="selectedTooth === dente.id ? 
            'bg-primary text-primary-foreground border-primary' : 
            'border-border hover:bg-accent hover:text-accent-foreground'"
          @click="selectTooth(dente.id)"
        >
          {{ dente.codigo_fdi }}
        </div>
      </div>
    </div>
    
    <!-- Dentes decíduos -->
    <div v-if="showDeciduous" class="grid grid-cols-2 gap-4 relative mt-4">
      <!-- Quadrante 5 (superior direito) -->
       <div class="absolute inset-y-0 left-1/2 w-0.5 -ml-[0.5px] bg-border"></div>
      <div class="flex justify-end gap-1">
        <div 
          v-for="dente in getDentesByQuadrante(5).reverse()" 
          :key="dente.id"
          class="w-9 h-9 flex items-center justify-center border rounded-md cursor-pointer transition-colors"
          :class="[
            selectedTooth === dente.id ? 
              'bg-primary text-primary-foreground border-primary' : 
              'border-border hover:bg-accent hover:text-accent-foreground',
            'bg-opacity-95' // Slightly different background for deciduous
          ]"
          @click="selectTooth(dente.id)"
        >
          {{ dente.codigo_fdi }}
        </div>
      </div>
      
      <!-- Quadrante 6 (superior esquerdo) -->
      <div class="flex justify-start gap-1">
        <div 
          v-for="dente in getDentesByQuadrante(6)" 
          :key="dente.id"
          class="w-9 h-9 flex items-center justify-center border rounded-md cursor-pointer transition-colors"
          :class="[
            selectedTooth === dente.id ? 
              'bg-primary text-primary-foreground border-primary' : 
              'border-border hover:bg-accent hover:text-accent-foreground',
            'bg-opacity-95' // Slightly different background for deciduous
          ]"
          @click="selectTooth(dente.id)"
        >
          {{ dente.codigo_fdi }}
        </div>
      </div>
      
      <!-- Linha divisória -->
      <div class="col-span-2 h-0.5 my-2 bg-border"></div>
      
      <!-- Quadrante 8 (inferior direito) -->
      <div class="flex  justify-end gap-1">
        <div 
          v-for="dente in getDentesByQuadrante(8).reverse()" 
          :key="dente.id"
          class="w-9 h-9 flex items-center justify-center border rounded-md cursor-pointer transition-colors"
          :class="[
            selectedTooth === dente.id ? 
              'bg-primary text-primary-foreground border-primary' : 
              'border-border hover:bg-accent hover:text-accent-foreground',
            'bg-opacity-95' // Slightly different background for deciduous
          ]"
          @click="selectTooth(dente.id)"
        >
          {{ dente.codigo_fdi }}
        </div>
      </div>
      
      <!-- Quadrante 7 (inferior esquerdo) -->
      <div class="flex  justify-start gap-1">
        <div 
          v-for="dente in getDentesByQuadrante(7)" 
          :key="dente.id"
          class="w-9 h-9 flex items-center justify-center border rounded-md cursor-pointer transition-colors"
          :class="[
            selectedTooth === dente.id ? 
              'bg-primary text-primary-foreground border-primary' : 
              'border-border hover:bg-accent hover:text-accent-foreground',
            'bg-opacity-95' // Slightly different background for deciduous
          ]"
          @click="selectTooth(dente.id)"
        >
          {{ dente.codigo_fdi }}
        </div>
      </div>
    </div>
    
    <!-- Seletor de tipo de dentição -->
    <div class="flex justify-center mt-6 gap-2">
      <Button 
        :variant="showPermanent && !showDeciduous ? 'default' : 'outline'"
        size="sm"
        @click="showPermanent = true; showDeciduous = false;"
      >
        Permanentes
      </Button>
      <Button 
        :variant="showDeciduous && !showPermanent ? 'default' : 'outline'"
        size="sm"
        @click="showDeciduous = true; showPermanent = false;"
      >
        Decíduos
      </Button>
      <Button 
        :variant="showPermanent && showDeciduous ? 'default' : 'outline'"
        size="sm"
        @click="showPermanent = true; showDeciduous = true;"
      >
        Ambos
      </Button>
    </div>
  </div>
</template>

