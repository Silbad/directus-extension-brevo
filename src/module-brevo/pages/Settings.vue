<template>
	<private-view title="Settings">
		<template #headline>Brevo</template>
		<template #title-outer:prepend>
			<v-button class="header-icon" rounded icon normal>
				<v-icon name="settings" />
			</v-button>
		</template>
		<template #navigation>
			<Navigation />
		</template>
	</private-view>
</template>

<script lang="ts" setup>
import Navigation from "./../components/Navigation.vue";
</script>
