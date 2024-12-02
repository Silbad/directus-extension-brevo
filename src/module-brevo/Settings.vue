<template>
	<private-view title="Settings">
		<template #headline>Brevo</template>
		<template #title-outer:prepend>
			<v-button class="header-icon" rounded disabled icon secondary>
				<v-icon name="settings" />
			</v-button>
		</template>
		<template #navigation>
			<MenuComponent />
		</template>
	</private-view>
</template>

<script lang="ts" setup>
import MenuComponent from "./Menu.vue";
</script>
