/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, {Component} from 'react';
import {
    StyleSheet,
    Text,
    TouchableHighlight,
    ActivityIndicator,
    Linking,
    TextInput,
    TouchableOpacity,
    FlatList,
    Image,
    Alert,
    ScrollView,
    View
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import ActiveButton from '../../components/common/ActiveButton';
import selectPayTypeCountdown from '../../mobx/selectPayTypeCountdown'

type Props = {};
export default class OrderDetail extends Component<Props> {

    constructor(props) {
        super(props);
        this.state = {
            isLoading: true,
            orderAftersalesId: '',
            orderInfo: {}

        }
    }

    componentDidMount() {
        this.state.orderAftersalesId = this.props.navigation.state.params.id;
        this.fetchData()
    }

    render() {
        if (this.state.isLoading) {
            return <View style={styles.loadingContainer}>
                <ActivityIndicator></ActivityIndicator>
            </View>
        } else {
            let orderInfo = this.state.orderInfo;
            let goodsList = [];
            orderInfo.order.orderItemList.map(value => {
                goodsList.push(
                    <View style={styles.goodsView}>
                        <View style={styles.goodsImgView}>
                            <Image
                                source={{uri: value.goodsImg + '?imageView2/1/w/200/h/200'}}
                                resizeMode='contain'
                                style={styles.goodsImg}
                            />
                        </View>
                        <View style={styles.goodsInfoView}>
                            <Text style={styles.goodsTitle}
                                  numberOfLines={2}>{value.goodsTitle}</Text>
                            <View style={styles.priceNumberView}>
                                <Text style={styles.priceText}>¥{value.putPrice}</Text>
                                <Text>×{value.number}</Text>
                            </View>
                        </View>
                    </View>
                )
            });
            let typeName = afterTypes.find(value => orderInfo.orderAftersalesStatus == value.id).name;
            let voucherImgs = [];
            // imgs = [
            //     {url: 'http://qiniumanagement.metchange.com/FivljDyn4-y37EtXgxolxcDzblJC'},
            //     {url: 'http://qiniumanagement.metchange.com/FivljDyn4-y37EtXgxolxcDzblJC'},
            //     {url: 'http://qiniumanagement.metchange.com/FivljDyn4-y37EtXgxolxcDzblJC'},
            //     {url: 'http://qiniumanagement.metchange.com/FivljDyn4-y37EtXgxolxcDzblJC'},
            //     {url: 'http://qiniumanagement.metchange.com/FivljDyn4-y37EtXgxolxcDzblJC'}
            // ]

            orderInfo.orderAftersalesVoucherList.map(value => {
                voucherImgs.push(
                    <View style={styles.imgWrapper}>
                        <Image
                            resizeMode='contain'
                            style={styles.img}
                            source={{uri: value.url}}
                        />
                    </View>
                )
            });
            return <View style={styles.container}>
                <View style={styles.itemView}>
                    <Text>退货商品</Text>
                    <View style={styles.goodsWrapper}>
                        {goodsList}
                    </View>
                </View>
                <View style={styles.itemView}>
                    <Text>申请原因:{orderInfo.comment}</Text>
                </View>
                {orderInfo.orderAftersalesVoucherList.length > 0 && <View style={styles.itemView}>
                    <Text>凭证</Text>
                    <View style={styles.imgView}>
                        {voucherImgs}
                    </View>

                </View>
                }

                <View style={styles.itemView}>
                    <Text>售后状态:{typeName}</Text>
                </View>
            </View>
        }

    }


    fetchData() {
        let params = {
            orderAftersalesId: this.state.orderAftersalesId
        };
        HttpUtils.get('/order/selectOrderAftersalesById', params, data => {
            console.warn(data.data)
            this.setState({
                orderInfo: data.data,
                isLoading: false,
            });
        })
    }


}

const styles = StyleSheet.create({
    container: {
        backgroundColor: whiteColor,
        flex: 1,

    },
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    goodsWrapper: {
        backgroundColor: '#f8f8f8',
    },
    goodsView: {
        flexDirection: 'row',
        width: screenWidth,
        alignItems: 'center',
        marginBottom: 10,
        marginTop: 10,
        paddingTop: 10,
        paddingBottom: 10
    },
    goodsImgView: {
        width: screenWidth * 0.25,
        height: screenWidth * 0.25,
        marginLeft: screenWidth * 0.05,
        borderWidth: 1,
        borderColor: borderColor,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: whiteColor,
    },
    goodsImg: {
        width: 80,
        height: 80
    },
    goodsInfoView: {
        justifyContent: 'space-between',
        width: screenWidth * 0.7,
        paddingLeft: 10,
        paddingRight: 10
    },
    goodsTitle: {},
    priceNumberView: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    priceText: {
        color: activeColor
    },
    itemView: {
        padding: 12
    },
    img: {
        width: 60,
        height: 60,
    },
    imgView: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        padding: 10
    },
    imgWrapper: {
        marginLeft: 10,
    }
});