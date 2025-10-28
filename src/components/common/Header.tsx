import { View, Text, TouchableOpacity } from 'react-native';
import React from 'react';
import { ArrowLeft } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

export default function Header({ title }: { 
    title: string; 
}) { 
  const navigation = useNavigation();

  const handleBackPress = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  return (
    <View style={{
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingTop: 40,
      height: 100,
      backgroundColor: '#ffffff',
    }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <TouchableOpacity onPress={handleBackPress} style={{ padding: 8 }}>
          <ArrowLeft color="black" size={24} />
        </TouchableOpacity>
        <Text style={{ fontSize: 22, fontWeight: '500', color: 'black' }}>{title}</Text>
      </View>
    </View>
  );
};