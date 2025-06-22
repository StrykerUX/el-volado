import React, { useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { COLORS } from '../constants/NeoBrutalTheme';

const { width, height } = Dimensions.get('window');

const FeatureHighlighter = ({ 
  isVisible, 
  targetRef, 
  highlightColor = COLORS.primary,
  pulseSpeed = 1000,
  children 
}) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const [elementPosition, setElementPosition] = React.useState(null);

  useEffect(() => {
    if (isVisible && targetRef?.current) {
      measureElement();
      startAnimations();
    } else {
      stopAnimations();
    }
  }, [isVisible]);

  const measureElement = () => {
    if (targetRef?.current) {
      targetRef.current.measure((x, y, width, height, pageX, pageY) => {
        setElementPosition({
          x: pageX,
          y: pageY,
          width,
          height,
        });
      });
    }
  };

  const startAnimations = () => {
    // Pulse animation
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: pulseSpeed / 2,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: pulseSpeed / 2,
          useNativeDriver: true,
        }),
      ])
    );

    // Glow animation
    const glowAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: pulseSpeed,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: pulseSpeed,
          useNativeDriver: true,
        }),
      ])
    );

    pulseAnimation.start();
    glowAnimation.start();
  };

  const stopAnimations = () => {
    pulseAnim.stopAnimation();
    glowAnim.stopAnimation();
    pulseAnim.setValue(1);
    glowAnim.setValue(0);
  };

  if (!isVisible || !elementPosition) {
    return children || null;
  }

  return (
    <>
      {children}
      
      {/* Highlight overlay */}
      <View style={styles.highlightContainer} pointerEvents="none">
        {/* Pulsing border */}
        <Animated.View
          style={[
            styles.highlight,
            {
              left: elementPosition.x - 8,
              top: elementPosition.y - 8,
              width: elementPosition.width + 16,
              height: elementPosition.height + 16,
              borderColor: highlightColor,
              transform: [{ scale: pulseAnim }],
            }
          ]}
        />
        
        {/* Glowing effect */}
        <Animated.View
          style={[
            styles.glow,
            {
              left: elementPosition.x - 20,
              top: elementPosition.y - 20,
              width: elementPosition.width + 40,
              height: elementPosition.height + 40,
              opacity: glowAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 0.3],
              }),
              backgroundColor: highlightColor,
            }
          ]}
        />
        
        {/* Corner indicators */}
        {renderCornerIndicators()}
      </View>
    </>
  );

  function renderCornerIndicators() {
    const cornerSize = 20;
    const cornerOffset = 5;
    
    return (
      <>
        {/* Top-left corner */}
        <Animated.View
          style={[
            styles.corner,
            styles.cornerTopLeft,
            {
              left: elementPosition.x - cornerOffset,
              top: elementPosition.y - cornerOffset,
              width: cornerSize,
              height: cornerSize,
              borderTopColor: highlightColor,
              borderLeftColor: highlightColor,
              opacity: glowAnim,
            }
          ]}
        />
        
        {/* Top-right corner */}
        <Animated.View
          style={[
            styles.corner,
            styles.cornerTopRight,
            {
              left: elementPosition.x + elementPosition.width - cornerSize + cornerOffset,
              top: elementPosition.y - cornerOffset,
              width: cornerSize,
              height: cornerSize,
              borderTopColor: highlightColor,
              borderRightColor: highlightColor,
              opacity: glowAnim,
            }
          ]}
        />
        
        {/* Bottom-left corner */}
        <Animated.View
          style={[
            styles.corner,
            styles.cornerBottomLeft,
            {
              left: elementPosition.x - cornerOffset,
              top: elementPosition.y + elementPosition.height - cornerSize + cornerOffset,
              width: cornerSize,
              height: cornerSize,
              borderBottomColor: highlightColor,
              borderLeftColor: highlightColor,
              opacity: glowAnim,
            }
          ]}
        />
        
        {/* Bottom-right corner */}
        <Animated.View
          style={[
            styles.corner,
            styles.cornerBottomRight,
            {
              left: elementPosition.x + elementPosition.width - cornerSize + cornerOffset,
              top: elementPosition.y + elementPosition.height - cornerSize + cornerOffset,
              width: cornerSize,
              height: cornerSize,
              borderBottomColor: highlightColor,
              borderRightColor: highlightColor,
              opacity: glowAnim,
            }
          ]}
        />
      </>
    );
  }
};

// Higher-order component for easy highlighting
export const withHighlight = (WrappedComponent, highlightConfig = {}) => {
  return React.forwardRef((props, ref) => {
    const [isHighlighted, setIsHighlighted] = React.useState(false);
    const elementRef = useRef(null);

    const highlight = (duration = 3000) => {
      setIsHighlighted(true);
      if (duration > 0) {
        setTimeout(() => setIsHighlighted(false), duration);
      }
    };

    const stopHighlight = () => {
      setIsHighlighted(false);
    };

    // Expose highlight controls to parent
    React.useImperativeHandle(ref, () => ({
      ...elementRef.current,
      highlight,
      stopHighlight,
    }));

    return (
      <FeatureHighlighter
        isVisible={isHighlighted}
        targetRef={elementRef}
        {...highlightConfig}
      >
        <WrappedComponent ref={elementRef} {...props} />
      </FeatureHighlighter>
    );
  });
};

// Hook for programmatic highlighting
export const useHighlight = () => {
  const [highlights, setHighlights] = React.useState({});

  const startHighlight = (elementId, targetRef, config = {}) => {
    setHighlights(prev => ({
      ...prev,
      [elementId]: {
        targetRef,
        config,
        isVisible: true,
      }
    }));
  };

  const stopHighlight = (elementId) => {
    setHighlights(prev => ({
      ...prev,
      [elementId]: {
        ...prev[elementId],
        isVisible: false,
      }
    }));
  };

  const stopAllHighlights = () => {
    setHighlights({});
  };

  const HighlightRenderer = () => (
    <>
      {Object.entries(highlights).map(([id, highlight]) => (
        <FeatureHighlighter
          key={id}
          isVisible={highlight.isVisible}
          targetRef={highlight.targetRef}
          {...highlight.config}
        />
      ))}
    </>
  );

  return {
    startHighlight,
    stopHighlight,
    stopAllHighlights,
    HighlightRenderer,
  };
};

const styles = StyleSheet.create({
  highlightContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: width,
    height: height,
    zIndex: 1000,
  },
  highlight: {
    position: 'absolute',
    borderWidth: 3,
    borderRadius: 8,
    borderStyle: 'solid',
  },
  glow: {
    position: 'absolute',
    borderRadius: 12,
  },
  corner: {
    position: 'absolute',
    borderWidth: 3,
    borderColor: 'transparent',
  },
  cornerTopLeft: {
    borderTopWidth: 3,
    borderLeftWidth: 3,
  },
  cornerTopRight: {
    borderTopWidth: 3,
    borderRightWidth: 3,
  },
  cornerBottomLeft: {
    borderBottomWidth: 3,
    borderLeftWidth: 3,
  },
  cornerBottomRight: {
    borderBottomWidth: 3,
    borderRightWidth: 3,
  },
});

export default FeatureHighlighter;