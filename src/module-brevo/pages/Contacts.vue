<template>
	<private-view title="Contacts">
		<template #headline>Brevo</template>
		<template #title-outer:prepend>
			<v-button class="header-icon" rounded disabled icon secondary>
				<v-icon name="person" />
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
