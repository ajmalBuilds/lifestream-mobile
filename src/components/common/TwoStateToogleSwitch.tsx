import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';

interface TwoStateToggleSwitchProps {
  selected: string;
  onToggle: (option: string) => void;
}

export default function TwoStateToggleSwitch({ selected, onToggle }: TwoStateToggleSwitchProps) {
  const slideAnim = React.useRef(new Animated.Value(selected === 'Blood' ? 0 : 1)).current;

  const handleToggle = (option: string) => {
    onToggle(option);
    Animated.spring(slideAnim, {
      toValue: option === 'Blood' ? 0 : 1,
      useNativeDriver: true,
      tension: 200,
      friction: 50,
    }).start();
  };

  const slideInterpolate = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [8, 160],
  });

  return (
      <View style={styles.toggleContainer}>
        <Animated.View 
          style={[
            styles.slider,
            {
              transform: [{ translateX: slideInterpolate }],
            }
          ]} 
        />
        
        <TouchableOpacity
          style={styles.option}
          onPress={() => handleToggle('Blood')}
          activeOpacity={0.7}
        >
          <Text style={[
            styles.optionText,
            selected === 'Blood' && styles.selectedText
          ]}>
            Blood
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.option}
          onPress={() => handleToggle('Platelets')}
          activeOpacity={0.7}
        >
          <Text style={[
            styles.optionText,
            selected === 'Platelets' && styles.selectedText
          ]}>
            Platelets
          </Text>
        </TouchableOpacity>
      </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 10,
    width: 320,
    height: 55,
    position: 'relative',
    overflow: 'hidden',
    marginBottom: 20,
  },
  slider: {
    position: 'absolute',
    width: 150,
    height: '100%',
    backgroundColor: 'white',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.6,
    shadowRadius: 4,
    borderWidth: 0.1,
    borderColor: '#aaa',
  },
  option: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  optionText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'black',
    zIndex: 3,
  },
  selectedText: {
    color: 'red',
    zIndex: 3,
  },
  resultText: {
    marginTop: 30,
    fontSize: 18,
    color: '#333',
  },
});