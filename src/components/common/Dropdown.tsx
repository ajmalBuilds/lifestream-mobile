import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Modal,
  FlatList,
  Dimensions,
  ViewStyle,
} from 'react-native';
import { ChevronDown, ChevronUp, Check } from 'lucide-react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface DropdownOption {
  label: string;
  value: string;
  icon?: React.ReactNode;
}

interface DropdownProps {
  options: DropdownOption[];
  selectedValue: string | null;
  onSelect: (value: string) => void;
  placeholder?: string;
  width?: number | string;
  height?: number;
  backgroundColor?: string;
  textColor?: string;
  accentColor?: string;
  disabled?: boolean;
}

export default function Dropdown({
  options,
  selectedValue,
  onSelect,
  placeholder = "Select an option",
  width = SCREEN_WIDTH - 40,
  height = 56,
  backgroundColor = '#ffffff',
  textColor = '#1f2937',
  accentColor = '#2962ff',
  disabled = false,
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const animatedValue = useRef(new Animated.Value(0)).current;
  const dropdownRef = useRef<View>(null);

  const selectedOption = options.find(opt => opt.value === selectedValue);

  const toggleDropdown = () => {
    if (disabled) return;

    // Measure dropdown position
    dropdownRef.current?.measureInWindow((x, y, measuredWidth, measuredHeight) => {
      setDropdownPosition({ 
        top: y + measuredHeight + 8, 
        left: x, 
        width: measuredWidth 
      });
    });

    if (isOpen) {
      Animated.timing(animatedValue, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => setIsOpen(false));
    } else {
      setIsOpen(true);
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  };

  const handleSelect = (value: string) => {
    onSelect(value);
    toggleDropdown();
  };

  const rotateAnimation = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const opacityAnimation = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const scaleAnimation = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.8, 1],
  });

  // Convert width to proper DimensionValue
  const getWidthStyle = (): ViewStyle => {
    if (typeof width === 'number') {
      return { width };
    }
    if (typeof width === 'string' && (width.endsWith('%') || width.endsWith('px'))) {
      return { width: width as any };
    }
    return { width: SCREEN_WIDTH - 40 };
  };

  return (
    <View style={[styles.container, getWidthStyle()]}>
      <TouchableOpacity
        ref={dropdownRef}
        style={[
          styles.dropdownButton,
          {
            height,
            backgroundColor,
            borderColor: isOpen ? accentColor : '#e5e7eb',
            opacity: disabled ? 0.6 : 1,
          },
        ]}
        onPress={toggleDropdown}
        disabled={disabled}
        activeOpacity={0.7}
      >
        <View style={styles.buttonContent}>
          <View style={styles.selectedContent}>
            {selectedOption?.icon && (
              <View style={styles.iconContainer}>
                {selectedOption.icon}
              </View>
            )}
            <Text
              style={[
                styles.buttonText,
                {
                  color: selectedValue ? textColor : '#9ca3af',
                },
              ]}
              numberOfLines={1}
            >
              {selectedOption?.label || placeholder}
            </Text>
          </View>
          <Animated.View style={{ transform: [{ rotate: rotateAnimation }] }}>
            <ChevronDown 
              size={20} 
              color={isOpen ? accentColor : '#6b7280'} 
            />
          </Animated.View>
        </View>
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        transparent
        animationType="none"
        onRequestClose={toggleDropdown}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={toggleDropdown}
        >
          <Animated.View
            style={[
              styles.dropdownList,
              {
                top: dropdownPosition.top,
                left: dropdownPosition.left,
                width: dropdownPosition.width || (typeof width === 'number' ? width : SCREEN_WIDTH - 40),
                opacity: opacityAnimation,
                transform: [{ scale: scaleAnimation }],
                borderColor: accentColor,
                shadowColor: accentColor,
              },
            ]}
          >
            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              showsVerticalScrollIndicator={true}
              nestedScrollEnabled
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.optionItem,
                    {
                      backgroundColor: 
                        item.value === selectedValue 
                          ? `${accentColor}15` 
                          : 'transparent',
                    },
                  ]}
                  onPress={() => handleSelect(item.value)}
                  activeOpacity={0.7}
                >
                  <View style={styles.optionContent}>
                    {item.icon && (
                      <View style={styles.optionIcon}>
                        {item.icon}
                      </View>
                    )}
                    <Text
                      style={[
                        styles.optionText,
                        {
                          color: textColor,
                          fontWeight: item.value === selectedValue ? '600' : '400',
                        },
                      ]}
                      numberOfLines={1}
                    >
                      {item.label}
                    </Text>
                  </View>
                  
                  {item.value === selectedValue && (
                    <Check size={18} color={accentColor} />
                  )}
                </TouchableOpacity>
              )}
              ItemSeparatorComponent={() => (
                <View style={styles.separator} />
              )}
            />
          </Animated.View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  dropdownButton: {
    borderRadius: 12,
    paddingHorizontal: 16,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: "#CCCCCC",
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectedContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    marginRight: 12,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  dropdownList: {
    position: 'absolute',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 2,
    maxHeight: 240,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    minHeight: 50,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionIcon: {
    marginRight: 12,
  },
  optionText: {
    fontSize: 15,
    flex: 1,
  },
  separator: {
    height: 1,
    backgroundColor: '#f3f4f6',
    marginHorizontal: 8,
  },
});