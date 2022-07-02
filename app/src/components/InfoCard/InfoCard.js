import React from 'react';

import {
    Card, 
    Div,
} from "@vkontakte/vkui"
import './style.css'
export const InfoCard = ({icon, title, descr}) => {
    const Icon = icon;
    return(
        <Card 
        size='s'
        className=''>
            <Div>
                <Icon className='info-card_icon' />
                <p className='info-card_title'>
                    {title}
                </p>
                <p className='info-card_descr'>
                    {descr}
                </p>
            </Div>
            
            
        </Card>
    )
}
