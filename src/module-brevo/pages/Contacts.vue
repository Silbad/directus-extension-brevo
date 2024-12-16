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
import { defineComponent } from 'vue';
import Navigation from "../components/Navigation.vue";

export default defineComponent({
	name: 'Contacts',
	components: {
		Navigation
	}
});
</script>
