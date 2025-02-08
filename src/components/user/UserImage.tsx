import { Avatar, Text, useMantineTheme } from '@mantine/core';
import { FunctionComponent } from 'react';
import { BasicUserType } from '../../models/User';
import { getInitials } from '../../utils/utilFunctions';
import { z } from 'zod';
import Image from 'next/image';

const UserImage: FunctionComponent<{
    user: BasicUserType;
    size?: number;
}> = ({ user, size = 100 }) => {
    const theme = useMantineTheme();

    const result = z.string().url().safeParse(user.image);

    if (result.success) {
        return (
            <Image
                alt="Profile Image"
                width={size}
                height={size}
                src={result.data}
                style={{ borderRadius: theme.fn.radius(theme.defaultRadius) }}
            />
        );
    } else {
        return (
            <Avatar
                variant="filled"
                size={size}
                color={user.themeColor}
            >
                <Text
                    weight="normal"
                    size={size / 1.75}
                >
                    {getInitials(user.name)}
                </Text>
            </Avatar>
        );
    }
};

export default UserImage;
