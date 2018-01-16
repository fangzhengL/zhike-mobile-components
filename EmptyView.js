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
  TouchableWithoutFeedback,
} from 'react-native';

export default function EmptyView(props:Object) {
  props = props || {};
  return (
    <View style={[styles.container, props.style]}>
      {
        props.image ?
          <Image
            style={props.imageStyle}
            source={props.image}
          />
        : null
      }
      {
        props.message ?
          <Text style={[styles.message, props.messageStyle]} >{props.message}</Text>
        : null
      }
      {
        (!props.image && !props.message) ? (
          <Text style={styles.cryFace}>{'(>_<)'}</Text>
        ) : null
      }
      {
        props.onPress ? (
          <TouchableWithoutFeedback
            onPress={props.onPress}
          >
            <View
              style={[
                {
                  borderRadius: 2,
                  borderColor: 'gray',
                  borderWidth: 1,
                  marginTop: 10,
                },
                props.actionButtonStyle
              ]}
            >
              <Text
                style={[
                  styles.cryFace,
                  {
                    fontSize:20,
                    marginTop:5,
                    marginBottom:5,
                    marginLeft:8,
                    marginRight:8,
                  },
                  props.actionButtonTextStyle
                ]}
              >
                {'重新加载'}
              </Text>
            </View>
          </TouchableWithoutFeedback>
        ) : null
      }
    </View>
  );
}

EmptyView.propTypes = {
  image: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.number,
  ]),
  imageStyle: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.number,
  ]),
  message: PropTypes.string,
  messageStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.number]),
  actionButtonStyle: View.propTypes.style,
  actionButtonTextStyle: Text.propTypes.style,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    alignSelf: 'stretch',
  },
  message: {
    color: 'gray',
    fontSize: 20,
  },
  cryFace: {
    color: 'gray',
    fontSize: 30,
  }
});
