// app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router'
import { StyleSheet } from 'react-native'

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: '#f0a500',
        tabBarInactiveTintColor: '#4a6480',
        tabBarLabelStyle: styles.tabLabel,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Ara',
          tabBarIcon: ({ color }) => (
            <TabIcon emoji="🔍" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="trending"
        options={{
          title: 'Trend',
          tabBarIcon: ({ color }) => (
            <TabIcon emoji="🔥" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="new"
        options={{
          title: 'Yeni',
          tabBarIcon: ({ color }) => (
            <TabIcon emoji="✨" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="watchlist"
        options={{
          title: 'Liste',
          tabBarIcon: ({ color }) => (
            <TabIcon emoji="🔖" color={color} />
          ),
        }}
      />
    </Tabs>
  )
}

function TabIcon({ emoji, color }: { emoji: string; color: string }) {
  const { Text } = require('react-native')
  return <Text style={{ fontSize: 22, opacity: color === '#f0a500' ? 1 : 0.5 }}>{emoji}</Text>
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#0a0f1c',
    borderTopColor: '#1a2640',
    borderTopWidth: 1,
    paddingTop: 6,
    paddingBottom: 4,
    height: 64,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 4,
  },
})
