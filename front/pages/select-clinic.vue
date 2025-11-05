<script setup lang="ts">
definePageMeta({
  layout: false, // or 'auth' if you have a separate auth layout
});

const user = useState('user');
const router = useRouter();

async function selectClinic(clinicId: number) {
  try {
    // Call your backend to set the active clinic
    await $fetch('/utilizadores/select-clinic', {
      method: 'POST',
      baseURL: useRuntimeConfig().public.apiBase,
      headers: {
        Authorization: `Bearer ${useCookie('token').value}`
      },
      body: {
        clinica_id: clinicId
      }
    });

    // Update the cookie
    const activeClinicCookie = useCookie("activeClinicId");
    activeClinicCookie.value = clinicId.toString();

    // Redirect to dashboard
    router.push('/?refresh=true');
  } catch (error) {
    console.error('Error selecting clinic:', error);
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-background">
    <Card class="w-full max-w-md">
      <CardHeader>
        <CardTitle>Selecione uma Clínica</CardTitle>
        <CardDescription>
          Escolha a clínica com a qual deseja trabalhar
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <div
          v-for="clinic in user?.clinicas"
          :key="clinic.clinica.id"
          class="p-4 border rounded-lg cursor-pointer hover:bg-accent transition-colors"
          @click="selectClinic(clinic.clinica.id)"
        >
          <div class="flex items-center gap-3">
            <div class="p-2 bg-primary/10 rounded-lg">
              <Users class="h-5 w-5 text-primary" />
            </div>
            <div>
              <div class="font-semibold">{{ clinic.clinica.nome }}</div>
              <div class="text-sm text-muted-foreground">
                {{ clinic.clinica.morada || clinic.clinica.email_envio || '' }}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>