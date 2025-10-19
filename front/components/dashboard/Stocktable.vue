<script setup lang="ts">


interface Item {
  id: number
  nome: string
  quantidade_atual: number
  quantidade_minima: number
  validade_proxima: string | null
}
defineProps<{ items: Item[] }>()
</script>

<template>
  <Card class="p-4">
    <CardHeader class="p-0 mb-2 flex justify-between items-center">
      <CardTitle>Stock Crítico</CardTitle>
      <slot name="actions" />
    </CardHeader>

    <CardContent class="p-0">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Item</TableHead>
            <TableHead class="text-right">Atual</TableHead>
            <TableHead class="text-right">Mínimo</TableHead>
            <TableHead>Validade</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          <TableRow v-for="i in items" :key="i.id">
            <TableCell>{{ i.nome }}</TableCell>
            <TableCell class="text-right">{{ i.quantidade_atual }}</TableCell>
            <TableCell class="text-right">{{ i.quantidade_minima }}</TableCell>
            <TableCell>{{ i.validade_proxima ?? '—' }}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </CardContent>
  </Card>
</template>
