// @flow
/**
* @Author: wansong
* @Date:   2016-06-24T13:06:59+08:00
* @Email:  betterofsong@gmail.com
*/


import React from 'react';
import PropTypes from 'prop-types';

import {
  View,
  Image,
  Text,
  StyleSheet,
} from 'react-native';
import RotatingView from './RotatingView';

const loadingImage = require('./img/img-loading.gif');

export default function LoadingView(props:Object) {
  let content = (
    <Image
      style={props.imageStyle}
      source={props.image}
      resizeMode={'contain'}
    />
  );
  if (props.rotationPeriod > 0) {
    content = (
      <RotatingView
        period={props.rotationPeriod}
      >
        {content}
      </RotatingView>
    );
  }
  return (
    <View style={[styles.container, props.style]}>
      {content}
      {
        !props.text ? null : (
          <Text
            style={[
              { color:'#8f9da6', fontSize:14, alignSelf:'center', marginTop:10 },
              props.textStyle,
            ]}
          >
            {props.text}
          </Text>
        )
      }
    </View>
  );
}

LoadingView.propTypes = {
  image: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.number,
  ]),
  imageStyle: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.number,
  ]),
};

LoadingView.defaultProps = {
  image: loadingImage,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    alignSelf: 'stretch',
  },
});
