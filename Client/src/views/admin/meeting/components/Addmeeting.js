// Client/src/views/admin/meeting/components/Addmeeting.js
import { 
    Button, 
    Flex, 
    FormLabel, 
    Grid, 
    GridItem, 
    IconButton, 
    Input, 
    Modal, 
    ModalBody, 
    ModalCloseButton, 
    ModalContent, 
    ModalFooter, 
    ModalHeader, 
    ModalOverlay, 
    Radio, 
    RadioGroup, 
    Stack, 
    Text, 
    Textarea 
} from '@chakra-ui/react';
import { CUIAutoComplete } from 'chakra-ui-autocomplete';
import MultiContactModel from 'components/commonTableModel/MultiContactModel';
import MultiLeadModel from 'components/commonTableModel/MultiLeadModel';
import Spinner from 'components/spinner/Spinner';
import dayjs from 'dayjs';
import { useFormik } from 'formik';
import { useEffect, useState } from 'react';
import { LiaMousePointerSolid } from 'react-icons/lia';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { MeetingSchema } from 'schema';
import { getApi, postApi } from 'services/api';
import { fetchContactData } from '../../../../redux/slices/contactSlice';
import { fetchLeadData } from '../../../../redux/slices/leadSlice';

const AddMeeting = (props) => {
    const { onClose, isOpen, setAction } = props;
    const [leaddata, setLeadData] = useState([]);
    const [contactdata, setContactData] = useState([]);
    const [isLoding, setIsLoding] = useState(false);
    const [contactModelOpen, setContactModel] = useState(false);
    const [leadModelOpen, setLeadModel] = useState(false);
    const [dataFetched, setDataFetched] = useState(false);
    
    const todayTime = new Date().toISOString().split('.')[0];
    
    const dispatch = useDispatch();
    const leadData = useSelector((state) => state?.leadData?.data);
    const contactList = useSelector((state) => state?.contactData?.data);
    const user = JSON.parse(localStorage.getItem('user'));

    const initialValues = {
        agenda: '',
        attendes: props.leadContect === 'contactView' && props.id ? [props.id] : [],
        attendesLead: props.leadContect === 'leadView' && props.id ? [props.id] : [],
        location: '',
        related: props.leadContect === 'contactView' ? 'Contact' : props.leadContect === 'leadView' ? 'Lead' : 'Contact',
        dateTime: '',
        notes: '',
        createBy: user?._id,
    };

    const formik = useFormik({
        initialValues: initialValues,
        validationSchema: MeetingSchema,
        onSubmit: (values, { resetForm }) => {
            AddData();
        },
    });

    const { errors, touched, values, handleBlur, handleChange, handleSubmit, setFieldValue, resetForm } = formik;

    const AddData = async () => {
        try {
            setIsLoding(true);
            
            // Prepare the data
            const payload = {
                ...values,
                createBy: user?._id
            };

            console.log('Submitting meeting data:', payload);

            // Make API call
            const response = await postApi('api/meeting/add', payload);
            
            if (response && response.status === 200) {
                toast.success('Meeting created successfully!');
                resetForm();
                setAction(prev => !prev); // Refresh the meeting list
                onClose(); // Close the modal
            } else {
                toast.error(response?.response?.data?.error || 'Failed to create meeting');
            }
        } catch (error) {
            console.error('Error creating meeting:', error);
            toast.error('Failed to create meeting');
        } finally {
            setIsLoding(false);
        }
    };

    const fetchAllData = async () => {
        if (dataFetched) return; // Prevent multiple calls
        
        try {
            console.log('Fetching contact and lead data...');
            
            const promises = [];
            
            // Only fetch if data doesn't exist
            if (!contactList || contactList.length === 0) {
                promises.push(dispatch(fetchContactData()));
            }
            
            if (!leadData || leadData.length === 0) {
                promises.push(dispatch(fetchLeadData()));
            }
            
            if (promises.length > 0) {
                await Promise.all(promises);
                console.log('Data fetched successfully');
            }
            
            setDataFetched(true);
            
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Failed to fetch data');
        }
    };

    // Fetch data when modal opens (only once)
    useEffect(() => {
        if (isOpen && !dataFetched) {
            fetchAllData();
        }
    }, [isOpen]);

    // Update local state when Redux data changes
    useEffect(() => {
        if (contactList && Array.isArray(contactList)) {
            setContactData(contactList);
        }
        if (leadData && Array.isArray(leadData)) {
            setLeadData(leadData);
        }
    }, [contactList, leadData]);

    // Reset data fetched flag when modal closes
    useEffect(() => {
        if (!isOpen) {
            setDataFetched(false);
        }
    }, [isOpen]);

    // Clear opposite attendees when related field changes
    useEffect(() => {
        if (values.related === 'Contact') {
            setFieldValue('attendesLead', []);
        } else if (values.related === 'Lead') {
            setFieldValue('attendes', []);
        }
    }, [values.related, setFieldValue]);

    const extractLabels = (selectedItems) => {
        return selectedItems.map((item) => item._id);
    };

    const countriesWithEmailAsLabel = (values.related === "Contact" ? contactdata : leaddata)?.map((item) => ({
        ...item,
        value: item._id,
        label: values.related === "Contact" ? 
            `${item.firstName || ''} ${item.lastName || ''}`.trim() || item.email : 
            item.leadName || item.leadEmail,
    })) || [];

    return (
        <Modal onClose={onClose} isOpen={isOpen} isCentered>
            <ModalOverlay />
            <ModalContent height={"580px"}>
                <ModalHeader>Add Meeting</ModalHeader>
                <ModalCloseButton />
                <ModalBody overflowY={"auto"} height={"400px"}>
                    {/* Contact Model */}
                    <MultiContactModel 
                        data={contactdata} 
                        isOpen={contactModelOpen} 
                        onClose={setContactModel} 
                        fieldName='attendes' 
                        setFieldValue={setFieldValue} 
                    />
                    
                    {/* Lead Model */}
                    <MultiLeadModel 
                        data={leaddata} 
                        isOpen={leadModelOpen} 
                        onClose={setLeadModel} 
                        fieldName='attendesLead' 
                        setFieldValue={setFieldValue} 
                    />

                    <Grid templateColumns="repeat(12, 1fr)" gap={3}>
                        <GridItem colSpan={{ base: 12 }}>
                            <FormLabel display='flex' ms='4px' fontSize='sm' fontWeight='500' mb='8px'>
                                Agenda<Text color={"red"}>*</Text>
                            </FormLabel>
                            <Input
                                fontSize='sm'
                                onChange={handleChange} 
                                onBlur={handleBlur}
                                value={values.agenda}
                                name="agenda"
                                placeholder='Enter meeting agenda'
                                fontWeight='500'
                                borderColor={errors.agenda && touched.agenda ? "red.300" : null}
                            />
                            <Text fontSize='sm' mb='10px' color={'red'}> 
                                {errors.agenda && touched.agenda && errors.agenda}
                            </Text>
                        </GridItem>

                        <GridItem colSpan={{ base: 12 }}>
                            <FormLabel display='flex' ms='4px' fontSize='sm' fontWeight='500' mb='8px'>
                                Related To<Text color={"red"}>*</Text>
                            </FormLabel>
                            <RadioGroup onChange={(e) => setFieldValue('related', e)} value={values.related}>
                                <Stack direction='row'>
                                    {props.leadContect === 'contactView' && <Radio value='Contact'>Contact</Radio>}
                                    {props.leadContect === 'leadView' && <Radio value='Lead'>Lead</Radio>}
                                    {!props.leadContect && (
                                        <>
                                            <Radio value='Contact'>Contact</Radio>
                                            <Radio value='Lead'>Lead</Radio>
                                        </>
                                    )}
                                </Stack>
                            </RadioGroup>
                            <Text mb='10px' color={'red'} fontSize='sm'> 
                                {errors.related && touched.related && errors.related}
                            </Text>
                        </GridItem>

                        {values.related && countriesWithEmailAsLabel.length > 0 && (
                            <GridItem colSpan={{ base: 12 }}>
                                <Flex alignItems={'end'} justifyContent={'space-between'}>
                                    <Text w={'100%'}>
                                        <CUIAutoComplete
                                            label={`Choose Preferred Attendees (${values.related})`}
                                            placeholder="Type a Name"
                                            name="attendes"
                                            items={countriesWithEmailAsLabel}
                                            className='custom-autoComplete'
                                            selectedItems={countriesWithEmailAsLabel?.filter((item) => 
                                                values.related === "Contact" ? 
                                                    values?.attendes.includes(item._id) : 
                                                    values?.attendesLead.includes(item._id)
                                            )}
                                            onSelectedItemsChange={(changes) => {
                                                const selectedLabels = extractLabels(changes.selectedItems);
                                                if (values.related === "Contact") {
                                                    setFieldValue('attendes', selectedLabels);
                                                } else {
                                                    setFieldValue('attendesLead', selectedLabels);
                                                }
                                            }}
                                        />
                                    </Text>
                                    <IconButton 
                                        mb={6} 
                                        onClick={() => {
                                            if (values.related === "Contact") {
                                                setContactModel(true);
                                            } else {
                                                setLeadModel(true);
                                            }
                                        }} 
                                        fontSize='25px' 
                                        icon={<LiaMousePointerSolid />} 
                                    />
                                </Flex>
                                <Text color={'red'}> 
                                    {errors.attendes && touched.attendes && errors.attendes}
                                </Text>
                            </GridItem>
                        )}

                        <GridItem colSpan={{ base: 12 }}>
                            <FormLabel display='flex' ms='4px' fontSize='sm' fontWeight='500' mb='8px'>
                                Location
                            </FormLabel>
                            <Input
                                fontSize='sm'
                                onChange={handleChange} 
                                onBlur={handleBlur}
                                value={values.location}
                                name="location"
                                placeholder='Enter meeting location'
                                fontWeight='500'
                                borderColor={errors.location && touched.location ? "red.300" : null}
                            />
                            <Text mb='10px' color={'red'} fontSize='sm'> 
                                {errors.location && touched.location && errors.location}
                            </Text>
                        </GridItem>

                        <GridItem colSpan={{ base: 12 }}>
                            <FormLabel display='flex' ms='4px' fontSize='sm' fontWeight='500' mb='8px'>
                                Date Time<Text color={"red"}>*</Text>
                            </FormLabel>
                            <Input
                                fontSize='sm'
                                type='datetime-local'
                                onChange={handleChange} 
                                onBlur={handleBlur}
                                min={dayjs().format('YYYY-MM-DDTHH:mm')}
                                value={values.dateTime}
                                name="dateTime"
                                fontWeight='500'
                                borderColor={errors.dateTime && touched.dateTime ? "red.300" : null}
                            />
                            <Text fontSize='sm' mb='10px' color={'red'}> 
                                {errors.dateTime && touched.dateTime && errors.dateTime}
                            </Text>
                        </GridItem>

                        <GridItem colSpan={{ base: 12 }}>
                            <FormLabel display='flex' ms='4px' fontSize='sm' fontWeight='500' mb='8px'>
                                Notes
                            </FormLabel>
                            <Textarea
                                resize={'none'}
                                fontSize='sm'
                                placeholder='Enter meeting notes (optional)'
                                onChange={handleChange} 
                                onBlur={handleBlur}
                                value={values.notes}
                                name="notes"
                                fontWeight='500'
                                borderColor={errors.notes && touched.notes ? "red.300" : null}
                            />
                            <Text mb='10px' color={'red'}> 
                                {errors.notes && touched.notes && errors.notes}
                            </Text>
                        </GridItem>
                    </Grid>
                </ModalBody>
                
                <ModalFooter>
                    <Button 
                        size="sm" 
                        variant='brand' 
                        me={2} 
                        disabled={isLoding} 
                        onClick={handleSubmit}
                    >
                        {isLoding ? <Spinner /> : 'Save'}
                    </Button>
                    <Button 
                        sx={{ textTransform: "capitalize" }} 
                        variant="outline"
                        colorScheme="red" 
                        size="sm" 
                        onClick={() => {
                            resetForm();
                            onClose();
                        }}
                    >
                        Close
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default AddMeeting;