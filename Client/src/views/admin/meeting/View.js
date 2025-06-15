// Client/src/views/admin/meeting/View.js
import {
    Box,
    Button,
    Flex,
    Grid,
    GridItem,
    Heading,
    Text,
    useColorModeValue,
    VStack,
    HStack,
    Badge,
    Divider
} from '@chakra-ui/react';
import Card from 'components/card/Card';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getApi } from 'services/api';
import { toast } from 'react-toastify';
import moment from 'moment';
import Spinner from 'components/spinner/Spinner';

const MeetingView = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const textColor = useColorModeValue("secondaryGray.900", "white");
    const textColorSecondary = "gray.400";

    const fetchMeetingData = async () => {
        try {
            setIsLoading(true);
            const response = await getApi(`api/meeting/view/${id}`);
            
            if (response && response.status === 200) {
                setData(response.data);
            } else {
                toast.error("Failed to fetch meeting details");
                navigate('/metting');
            }
        } catch (error) {
            console.error('Error fetching meeting:', error);
            toast.error("Failed to fetch meeting details");
            navigate('/metting');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (id) {
            fetchMeetingData();
        }
    }, [id]);

    const formatDate = (dateString) => {
        return moment(dateString).format('MMMM DD, YYYY hh:mm A');
    };

    const formatTimestamp = (timestamp) => {
        return moment(timestamp).format('MMMM DD, YYYY hh:mm A');
    };

    if (isLoading) {
        return (
            <Flex justify="center" align="center" h="50vh">
                <Spinner />
            </Flex>
        );
    }

    if (!data) {
        return (
            <Flex justify="center" align="center" h="50vh">
                <Text>Meeting not found</Text>
            </Flex>
        );
    }

    return (
        <Box pt={{ base: "130px", md: "80px", xl: "80px" }}>
            {/* Header */}
            <Flex justify="space-between" align="center" mb={6}>
                <Heading size="lg" color={textColor}>
                    Meeting Details
                </Heading>
                <Button
                    variant="outline"
                    colorScheme="brand"
                    onClick={() => navigate('/metting')}
                >
                    Back to Meetings
                </Button>
            </Flex>

            <Grid templateColumns={{ base: "1fr", lg: "2fr 1fr" }} gap={6}>
                {/* Main Meeting Information */}
                <GridItem>
                    <Card>
                        <VStack spacing={6} align="stretch">
                            {/* Meeting Agenda */}
                            <Box>
                                <Text fontSize="lg" fontWeight="bold" color={textColor} mb={2}>
                                    Agenda
                                </Text>
                                <Text color={textColorSecondary}>
                                    {data.agenda || 'No agenda specified'}
                                </Text>
                            </Box>

                            <Divider />

                            {/* Date and Time */}
                            <HStack justify="space-between">
                                <Box>
                                    <Text fontSize="md" fontWeight="bold" color={textColor} mb={1}>
                                        Scheduled Date & Time
                                    </Text>
                                    <Text color={textColorSecondary}>
                                        {data.dateTime ? formatDate(data.dateTime) : 'Not scheduled'}
                                    </Text>
                                </Box>
                                <Box>
                                    <Text fontSize="md" fontWeight="bold" color={textColor} mb={1}>
                                        Created On
                                    </Text>
                                    <Text color={textColorSecondary}>
                                        {formatTimestamp(data.timestamp)}
                                    </Text>
                                </Box>
                            </HStack>

                            <Divider />

                            {/* Location */}
                            <Box>
                                <Text fontSize="md" fontWeight="bold" color={textColor} mb={2}>
                                    Location
                                </Text>
                                <Text color={textColorSecondary}>
                                    {data.location || 'No location specified'}
                                </Text>
                            </Box>

                            <Divider />

                            {/* Notes */}
                            <Box>
                                <Text fontSize="md" fontWeight="bold" color={textColor} mb={2}>
                                    Notes
                                </Text>
                                <Text color={textColorSecondary}>
                                    {data.notes || 'No notes added'}
                                </Text>
                            </Box>
                        </VStack>
                    </Card>
                </GridItem>

                {/* Sidebar Information */}
                <GridItem>
                    <VStack spacing={4} align="stretch">
                        {/* Created By */}
                        <Card>
                            <VStack spacing={3} align="stretch">
                                <Text fontSize="md" fontWeight="bold" color={textColor}>
                                    Created By
                                </Text>
                                <Text color={textColorSecondary}>
                                    {data.createBy ? 
                                        `${data.createBy.firstName || ''} ${data.createBy.lastName || ''}`.trim() || 
                                        data.createBy.username : 
                                        'Unknown User'
                                    }
                                </Text>
                            </VStack>
                        </Card>

                        {/* Related To */}
                        <Card>
                            <VStack spacing={3} align="stretch">
                                <Text fontSize="md" fontWeight="bold" color={textColor}>
                                    Related To
                                </Text>
                                <Badge 
                                    colorScheme={data.related === 'Contact' ? 'blue' : 'green'} 
                                    variant="solid"
                                    width="fit-content"
                                >
                                    {data.related || 'None'}
                                </Badge>
                            </VStack>
                        </Card>

                        {/* Attendees */}
                        <Card>
                            <VStack spacing={3} align="stretch">
                                <Text fontSize="md" fontWeight="bold" color={textColor}>
                                    Attendees
                                </Text>
                                
                                {/* Contact Attendees */}
                                {data.attendes && data.attendes.length > 0 && (
                                    <Box>
                                        <Text fontSize="sm" fontWeight="semibold" color={textColor} mb={2}>
                                            Contacts:
                                        </Text>
                                        {data.attendes.map((contact, index) => (
                                            <Text key={index} color={textColorSecondary} fontSize="sm">
                                                • {contact.firstName} {contact.lastName}
                                                {contact.email && ` (${contact.email})`}
                                            </Text>
                                        ))}
                                    </Box>
                                )}

                                {/* Lead Attendees */}
                                {data.attendesLead && data.attendesLead.length > 0 && (
                                    <Box>
                                        <Text fontSize="sm" fontWeight="semibold" color={textColor} mb={2}>
                                            Leads:
                                        </Text>
                                        {data.attendesLead.map((lead, index) => (
                                            <Text key={index} color={textColorSecondary} fontSize="sm">
                                                • {lead.leadName}
                                                {lead.leadEmail && ` (${lead.leadEmail})`}
                                            </Text>
                                        ))}
                                    </Box>
                                )}

                                {(!data.attendes || data.attendes.length === 0) && 
                                 (!data.attendesLead || data.attendesLead.length === 0) && (
                                    <Text color={textColorSecondary} fontSize="sm">
                                        No attendees specified
                                    </Text>
                                )}
                            </VStack>
                        </Card>

                        {/* Meeting Status */}
                        <Card>
                            <VStack spacing={3} align="stretch">
                                <Text fontSize="md" fontWeight="bold" color={textColor}>
                                    Status
                                </Text>
                                <Badge 
                                    colorScheme={
                                        new Date(data.dateTime) > new Date() ? 'green' : 
                                        new Date(data.dateTime).toDateString() === new Date().toDateString() ? 'orange' : 'red'
                                    }
                                    variant="solid"
                                    width="fit-content"
                                >
                                    {new Date(data.dateTime) > new Date() ? 'Upcoming' : 
                                     new Date(data.dateTime).toDateString() === new Date().toDateString() ? 'Today' : 'Past'}
                                </Badge>
                            </VStack>
                        </Card>
                    </VStack>
                </GridItem>
            </Grid>
        </Box>
    );
};

export default MeetingView;