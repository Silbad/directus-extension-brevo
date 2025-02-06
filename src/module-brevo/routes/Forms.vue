<template>
	<private-view title="Contacts">
		<template #headline>Brevo</template>
		<template #title-outer:prepend>
			<v-button class="header-icon" rounded icon normal>
				<v-icon name="person" />
			</v-button>
		</template>
		<template #navigation>
			<Navigation />
		</template>
	</private-view>
</template>

<script lang="ts">
import { defineComponent, onMounted } from 'vue';
import Navigation from "../components/Navigation.vue";
import { useApi } from '@directus/extensions-sdk';

export default defineComponent({
	name: 'Contacts',
	components: {
		Navigation
	},
	setup() {
		const api = useApi();
		
		onMounted(() => {
			console.log('Le composant est monté et prêt !');
		});
		return {};
	}
});
</script>
