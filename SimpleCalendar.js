import React, {
  Component,
  PropTypes,
} from 'react';
import {
  Text,
  View,
  Image,
  ScrollView,
  StyleSheet,
  Dimensions,
  TouchableWithoutFeedback,
} from 'react-native';
import _ from 'lodash';

const { width: ScreenWidth, height:ScreenHeight } = Dimensions.get('window');
const DateCellWidth = ScreenWidth / 7.0 - 20;
const SelectedDatePointer = require('./img/ic-calendar-pointer.png');

export default class SimpleCalendar extends Component {
  static _daysInCurrentWeek() {
    const x = new Date();
    const date = x.getDate();
    const day = x.getDay();
    return _.range(7).map(
      (ii) => {
        const xx = new Date(x.getTime());
        xx.setDate(ii + date - day);
        return xx;
      }
    );
  }

  static _dateFromOffset(date, offset) {
    const ret = new Date(date.getTime());
    ret.setDate(offset + ret.getDate());
    return ret;
  }

  static _lastCurrentNextWeekdays(weekOffset) {
    const currentWeekdays = this._daysInCurrentWeek();
    return {
      lastWeekdays: currentWeekdays.map(date => this._dateFromOffset(date, -7 + 7 * weekOffset)),
      currentWeekdays: currentWeekdays.map(date => this._dateFromOffset(date, 7 * weekOffset)),
      nextWeekdays: currentWeekdays.map(date => this._dateFromOffset(date, 7 + 7 * weekOffset)),
    };
  }

  static _dayString = (
    function () {
      const WeekNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
      return ii => WeekNames[ii];
    }
  )();

  static _compareDate(d1, d2) {
    if (d1.getFullYear() < d2.getFullYear()) {
      return -1;
    } else if (d1.getFullYear() > d2.getFullYear()) {
      return 1;
    } else if (d1.getMonth() < d2.getMonth()) {
      return -1;
    } else if (d1.getMonth() > d2.getMonth()) {
      return 1;
    } else {
      return d1.getDate() - d2.getDate();
    }
  }

  static _isDateEqual(d1, d2) {
    return this._compareDate(d1, d2) === 0;
  }

  static _isFuture(d) {
    return this._compareDate(new Date(), d) < 0;
  }

  static propTypes = {
    onDateSelected: PropTypes.func,
    // dates equal accuracy: day, defaults to today
    date: PropTypes.object,  // eslint-disable-line
    backgroundImageSource: PropTypes.oneOfType([PropTypes.object, PropTypes.number]),
    selectedPointer: PropTypes.oneOfType([
      PropTypes.number, PropTypes.object
    ])
  };

  static defaultProps = {
    date: new Date(),
    selectedPointer: SelectedDatePointer,
  };

  constructor(props) {
    super(props);
    this.state = {
      measuredSize: null,
      // weekOffset restrained to be positive
      weekOffset: 0,
      ...SimpleCalendar._lastCurrentNextWeekdays(0),
    };
    this._onContainerLayout = this._onContainerLayout.bind(this);
    this._onDayContainerLayout = this._onDayContainerLayout.bind(this);
    this._onScrollEnd = this._onScrollEnd.bind(this);

    this._lastOffsetX = 0;
  }

  _isSelectedDate(d1) {
    return this.constructor._isDateEqual(d1, this.props.date);
  }

  _isSelectedDayOfWeek(dayOfWeek: number) {
    return this.props.date.getDay() === dayOfWeek;
  }


  _onScrollEnd(e) {
    const newOffset = e.nativeEvent.contentOffset.x;
    const nextState = {};
    if (newOffset - this._lastOffsetX > 1) {
      nextState.weekOffset = this.state.weekOffset + 1;
    } else if (newOffset - this._lastOffsetX < -1) {
      nextState.weekOffset = this.state.weekOffset - 1;
    }
    this.setState(
      nextState,
      () => this._adjustScroll()
    );
  }

  _onContainerLayout(e) {
    const layout = e.nativeEvent.layout;
    console.log(layout);
    this.setState(
      {
        measuredSize: {
          width: layout.width,
          height: layout.height,
        }
      },
      () => this._adjustScroll()
    );
  }

  _onDayContainerLayout(e) {
    const layout = e.nativeEvent.layout;
    console.log('fuck: ', layout);
    this.setState({
      dayContainerSize: {
        width: layout.width,
        height: layout.height,
      }
    });
  }

  _onSelectDate(date) {
    if (!this.constructor._isFuture(date)) {
      console.log('selected date: ', date);
      this.props && this.props.onDateSelected && this.props.onDateSelected(date);
    }
  }

  _selectedDayOfWeek() {
    return this.props.date.getDay();
  }

  _futureDateTextStyle() {
    return {
      color: '#8f9ba6',
      fontSize: 14,
    };
  }

  _renderWeekdays(weekdays: Array<Date>, offsetKey = 0) {
    const today = new Date();
    return weekdays.map(
      (d, ii) => (
        <TouchableWithoutFeedback
          key={`weekdays-${offsetKey}-${ii}`}
          onPress={() => this._onSelectDate(d)}
        >
          <View
            style={{
              marginLeft:6,
              marginRight:6,
              alignSelf:'stretch',
              width:DateCellWidth,
              overflow:'visible',
              marginBottom: 10,
              alignItems:'center',
            }}
          >
            {
              this._isSelectedDate(d) ? (
                <Image
                  source={this.props.selectedPointer}
                  style={{
                    position:'absolute',
                    bottom:-12,
                    left:0,
                    right:0,
                    height:this.state.barHeight || 0,
                    width: undefined,
                  }}
                  resizeMode={Image.resizeMode.cover}
                />
              ) : null
            }
            <Text
              style={[
                { fontSize:14, color:'#ffffff', backgroundColor:'transparent' },
                this.constructor._isFuture(d) ? this._futureDateTextStyle() : null,
              ]}
            >
              {`${this.constructor._isDateEqual(d, today) ? '今日' : d.getDate()}`}
            </Text>
          </View>
        </TouchableWithoutFeedback>
      )
    );
  }

  _adjustScroll() {
    const offsetX = this.state.measuredSize.width;
    this.scrollView && this.scrollView.scrollTo({ x:offsetX, animated:false });
    this._lastOffsetX = offsetX;
  }

  _measuredSize() {
    if (!this.state.measuredSize) return null;
    const ret = {
      width: this.state.measuredSize.width,
      height: this.state.dayContainerSize && this.state.dayContainerSize.height || this.state.measuredSize.height || 0,
    };
    return ret;
  }

  render() {
    const weekdays = SimpleCalendar._lastCurrentNextWeekdays(this.state.weekOffset);
    return (
      <View
        style={[styles.container, this.props.style]}
        onLayout={
          ({ nativeEvent }) => this.setState({
            barHeight:nativeEvent && nativeEvent.layout && nativeEvent.layout.height
          })
        }
      >
        {
          this.props.backgroundImageSource ?
            <Image
              style={{
                position:'absolute',
                height:undefined,
                width:undefined,
                left:0,
                right:0,
                top:0,
                bottom:0
              }}
              source={this.props.backgroundImageSource}
            /> : null
        }
        {
          this.state.dayContainerSize ? (
            <ScrollView
              ref={ref => (this.scrollView = ref)}
              style={[styles.scrollView, this._measuredSize()]}
              scrollEventThrottle={16}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={this._onScrollEnd}
              onLayout={() => this._adjustScroll()}
              overflow={'visible'}
            >
              {
                <View
                  style={[styles.datePage, this._measuredSize()]}
                >
                  {
                    this._renderWeekdays(weekdays.lastWeekdays)
                  }
                </View>
              }
              {
                <View
                  style={[styles.datePage, this._measuredSize()]}
                >
                  {
                    this._renderWeekdays(weekdays.currentWeekdays)
                  }
                </View>
              }
              {
                this.state.weekOffset < 0 ?
                  <View
                    style={[styles.datePage, this._measuredSize()]}
                  >
                    {
                    this._renderWeekdays(weekdays.nextWeekdays)
                  }
                  </View>
                : null
              }
            </ScrollView>
          ) : (
            <View
              style={[styles.datePage]}
              onLayout={this._onDayContainerLayout}
            >
              {
                this._renderWeekdays(weekdays.currentWeekdays)
              }
            </View>
          )
        }

        <View
          style={[styles.datePage, { marginBottom:9 }]}
          onLayout={this._onContainerLayout}
        >
          {
            _.range(7).map(ii => SimpleCalendar._dayString(ii)).map(
              (dayString, ii) => (
                <TouchableWithoutFeedback
                  key={`weekday-names-${ii}`}
                  onPress={() => this._onSelectDate(this.state.currentWeekdays[ii])}
                >
                  <View
                    style={{
                      width: DateCellWidth,
                      marginLeft:6,
                      marginRight:6,
                      justifyContent:'center',
                      alignItems: 'center',
                    }}
                  >
                    <Text
                      style={[
                        {
                          fontSize:14,
                          color:'#ffffff',
                          backgroundColor:'transparent',
                        },
                        (this.state.weekOffset === 0 && ii > new Date().getDay()) && this._futureDateTextStyle(),
                      ]}
                    >
                      {dayString}
                    </Text>
                  </View>
                </TouchableWithoutFeedback>
              )
            )
          }
        </View>
      </View>
    );
  }
}


const styles = StyleSheet.create({
  container: {
    alignSelf: 'stretch',
    flexDirection: 'column-reverse',
    paddingTop: 10,
  },
  scrollView: {
    alignSelf: 'stretch',
  },
  datePage: {
    justifyContent:'space-between',
    flexDirection:'row',
    paddingLeft:9,
    paddingRight:9,
    alignSelf:'stretch',
  },
});
