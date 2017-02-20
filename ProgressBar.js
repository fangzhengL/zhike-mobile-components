//@flow
/**
* @Author: wansongmbpwork
* @Date:   2016-08-23T14:02:40+08:00
* @Email:  betterofsong@gmail.com
*/

import React, {
  Component,
  PropTypes,
} from 'react';

import {
  Animated,
  Easing,
  View,
  StyleSheet,
  PanResponder,
} from 'react-native';

let cursorSize = {
  width: 6,
  height: 6,
};

export default class ProgressBar extends Component {
  static propTypes = {
    progress: PropTypes.number.isRequired,
    onPanBegin: PropTypes.func,
    onPanFinish: PropTypes.func,
    onPanProgress: PropTypes.func,
    unCoveredPropsStyle: PropTypes.object,
    coveredPropsStyle: PropTypes.object,
    cursorPropsStyle: PropTypes.object,
  };

  constructor(props) {
    super(props);

    const progressValue = new Animated.Value(props && props.progress ? props.progress : 0);
    this._trackedProgress = 0;

    progressValue.addListener((value) => {
      if (value && {}.hasOwnProperty.call(value, 'value')) {
        this._trackedProgress = parseFloat(value.value);
      }
    });

    this.state = {
      progress: progressValue,
      layoutWidth: 0,
    };
  }

  componentWillMount() {
    this.updateProgressAnimated(this.props && this.props.progress ? this.props.progress : 0, false);

    this._panGesture = PanResponder.create({
      onStartShouldSetPanResponder: (evt, gestureState) => true,
      onStartShouldSetPanResponderCapture: (evt, gestureState) => true,
      onMoveShouldSetPanResponder: (evt, gestureState) => true,
      onMoveShouldSetPanResponderCapture: (evt, gestureState) => true,

      onPanResponderGrant: (evt, gestureState) => {
        // The guesture has started. Show visual feedback so the user knows
        // what is happening!
        // gestureState.{x,y}0 will be set to zero now
        this.props && this.props.onPanBegin && this.props.onPanBegin(evt, gestureState);
        this._beginPanProgress = this._trackedProgress;
      },
      onPanResponderMove: (evt, gestureState) => {
        // The most recent move distance is gestureState.move{X,Y}

        // The accumulated gesture distance since becoming responder is
        // gestureState.d{x,y}

        if (gestureState && gestureState.dx && this.state.layoutWidth > 0) {
          let updatedProgress = this._beginPanProgress + (gestureState.dx / this.state.layoutWidth);
          updatedProgress = Math.min(1, Math.max(0, updatedProgress));
          this.props.onPanProgress && this.props.onPanProgress(evt, gestureState, updatedProgress);

          this.updateProgressAnimated(updatedProgress, false);
        }
      },
      onPanResponderTerminationRequest: (evt, gestureState) => true,
      onPanResponderRelease: (evt, gestureState) => {
        // The user has released all touches while this view is the
        // responder. This typically means a gesture has succeeded
        this.props.onPanFinish && this.props.onPanFinish(evt, gestureState, this._trackedProgress);
      },
      onPanResponderTerminate: (evt, gestureState) => {
        // Another component has become the responder, so this gesture
        // should be cancelled
        this.props.onPanFinish && this.props.onPanFinish(evt, gestureState, this._trackedProgress);
      },
      onShouldBlockNativeResponder: (evt, gestureState) =>
        // Returns whether this component should block native components from becoming the JS
        // responder. Returns true by default. Is currently only supported on android.
         true
      ,
    });
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps && {}.hasOwnProperty.call(nextProps, 'progress')) {
      this.updateProgressAnimated(nextProps.progress, true);
    }
  }

  updateProgressAnimated(progress_, animated, completion) {
    const progress = progress_ || 0;
    if (animated) {
      Animated.timing(this.state.progress, {
        toValue: progress,
        duration: 25,
        easing: Easing.linear,
        isInteraction: false,
      }).start((endState) => {
        completion && completion(endState);
      });
    } else {
      this.state.progress.setValue(progress);
      completion && completion();
    }
  }
  _coveredStyle() {
    return {
      width: this.state.progress.interpolate({
        inputRange:[0.0, 1.0],
        outputRange: [0, this.state.layoutWidth],
      }),
    };
  }
  _unCoveredStyle() {
    return {
      width: this.state.progress.interpolate({
        inputRange:[0.0, 1.0],
        outputRange: [this.state.layoutWidth, 0],
      }),
    };
  }

  _cursorStyle() {
    const width = this.state.layoutWidth;
    const interpolatedLeft = this.state.progress.interpolate({
      inputRange:[0.0, 1.0],
      outputRange: [-this.cursorSize.width / 2.0, (-this.cursorSize.width / 2.0) + width],
    });
    const top = (containerSize.height - this.cursorSize.height) / 2.0;
    return {
      left: interpolatedLeft,
      top,
    };
  }

  get cursorSize() :{width: number, height: number} {
    if (this.props && this.props.cursorSize) {
      return {
        ...this.props.cursorSize,
        borderRadius: this.props.cursorSize.width / 2.0
      };
    } else {
      return cursorSize;
    }
  }

  render() {
    return (
      <View
        style={[this.props.style, { justifyContent:'center' }]}
        {...this._panGesture.panHandlers}
        onLayout={(e) => {
          if (e && e.nativeEvent && e.nativeEvent.layout) {
            const width = e.nativeEvent.layout.width;
            this.setState({ layoutWidth:width });
          }
        }}
      >
        <View style={[styles.container, containerSize]} >
          <Animated.View style={[styles.progressArea, styles.unCoveredPart,this.props.unCoveredPropsStyle ? this.props.unCoveredPropsStyle : null]} />
          <Animated.View style={[styles.progressArea, styles.coveredPart, this._coveredStyle(),this.props.coveredPropsStyle ? this.props.coveredPropsStyle : null]} />
          <Animated.View style={[styles.cursor, this.cursorSize, this._cursorStyle(),this.props.cursorPropsStyle ? this.props.cursorPropsStyle : null]} />
        </View>
      </View>
    );
  }
}

const containerSize = {
  height: 2,
};

let styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flexDirection: 'row',
    ...containerSize,
  },
  progressArea: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
  },
  coveredPart: {
    backgroundColor: '#00b5e9',
  },
  unCoveredPart: {
    right: 0,
    backgroundColor: '#e6e6e6',
  },
  cursor: {
    position: 'absolute',
    borderRadius: cursorSize.width / 2,
    backgroundColor: '#ffffff',
    ...cursorSize,

    shadowColor: '#666666',
    shadowOpacity: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 2,
  },
});
