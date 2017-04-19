// @flow

import React, { Component, PropTypes } from 'react';
import {
  Text,
  View,
  Animated,
  Easing,
} from 'react-native';

export default class RotatingView extends Component {
  static propTypes = {
    period: PropTypes.number,
  };

  static defaultProps = {
    rotating: true,
    period: 1500,
  };

  state: {
    rotation: any
  }
  interpolatedAngle: any
  unMounted: bool

  constructor(props:any) {
    super(props);
    this.state = { rotation:new Animated.Value(0) };
    this.interpolatedAngle = this.state.rotation.interpolate({
      inputRange: [0, 360],
      outputRange: ['0deg', '360deg'],
    });
  }

  componentDidMount() {
    if (this.props.rotating) {
      this._rotate();
    }
  }

  componentWillUnmount() {
    this.unMounted = true;
  }

  _rotate() {
    Animated.timing(
      this.state.rotation,
      {
        toValue: 360,
        duration: this.props.period,
        easing: Easing.linear,
      }
    ).start(() => {
      this.state.rotation.setValue(0);
      this.props.rotating && !this.unMounted && this._rotate();
    });
  }

  render() {
    return (
      <Animated.View
        style={[this.props.style, { transform:[{ rotate:this.interpolatedAngle }] }]}
      >
        { this.props.children }
      </Animated.View>
    );
  }
}
