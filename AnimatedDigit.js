import React, {
  Component,
  PropTypes,
} from 'react';
import {
  View,
  Text,
  Animated,
} from 'react-native';
import _ from 'lodash';

export default class AnimatedNumber extends Component {
  static propTypes = {
    value: PropTypes.number,
    height: PropTypes.number,
    width: PropTypes.number,
    duration: PropTypes.number, // of miliseconds
    textStyle: PropTypes.oneOfType([PropTypes.number, PropTypes.object]),
    cardColor: PropTypes.string,
  };

  static defaultProps = {
    height: 50,
    width: 40,
    duration: 400,
    cardColor: '#2a3d4f',
  };

  constructor(props) {
    super(props);
    this.state = {
      from: props.value,
      to: props.value,
    };
    this.animations = [];
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps && nextProps.value !== this.props.value) {
      this._clearAnimations(
        () => {
          this.setState(
            { to:nextProps.value },
            () => this._startAnimations(() => this.setState({ from:this.state.to }))
          );
        }
      );
    }
  }

  get height() {
    return this.props.height;
  }

  get width() {
    return this.props.width;
  }

  get duration() {
    return this.props.duration;
  }

  _clearAnimations(callback) {
    const callbackEach = (ii) => {
      if (this.animations.filter(v => !!v).length !== 0) {
        this.animations[ii] = undefined;
        if (this.animations.filter(v => !!v).length === 0) {
          this.animations = [];
          callback();
        }
      }
    };
    const existings = this.animations.filter(v => !!v);
    if (!existings || existings.length === 0) {
      callback();
    } else {
      this.animations.forEach(
        (anim, ii) => (anim && anim.stopAnimation(() => callbackEach(ii)))
      );
    }
  }

  _startAnimations(callback) {
    const reverse = this.state.to < this.state.from;
    const anims = this.animations.filter(v => !!v)
    .map(v => Animated.timing(v, { toValue:1, duration:this.duration}));
    Animated.sequence(reverse ? anims.map((anim, ii, arr) => arr[arr.length - 1 - ii]) : anims).start(callback);
  }

  renderCards() {
    const step = this.state.to > this.state.from ? 1 : -1;
    _.range(this.state.from, this.state.to + step, step).forEach(
      (value, ii, arr) => {
        (ii === arr.length - 1) ? null : this.animations[value] = new Animated.Value(0);
      }
    );
    return _.range(this.state.to, this.state.from - step, -step)
    .map(
      (v, ii, arr) => (
        <Animated.View
          key={`card-${v}`}
          style={{
            position:'absolute',
            left:0,
            right:0,
            top: (ii === 0) ? 0 : this.animations[v].interpolate({
              inputRange:[0,1],
              outputRange:[0, step * this.height],
            }),
            height: this.height,
            alignItems:'center',
            justifyContent:'center',
            backgroundColor:this.props.cardColor,
          }}
        >
          <Text
            style={[
              {
                fontSize:14,
                color:'red',
                backgroundColor:'transparent'
              },
              this.props.textStyle,
            ]}
          >
            {v}
          </Text>
        </Animated.View>
      )
    );
  }

  render() {
    return (
      <View
        style={[
          {
            height:this.height,
            width:this.width,
            alignSelf:'center'
          },
          this.props.style
        ]}
        overflow={'hidden'}
      >
        {this.renderCards()}
      </View>
    );
  }
}
