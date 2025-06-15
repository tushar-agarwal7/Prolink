// Client/src/views/admin/meeting/index.js
import { useEffect, useState } from 'react';
import { DeleteIcon, ViewIcon, EditIcon } from '@chakra-ui/icons';
import { Button, Menu, MenuButton, MenuItem, MenuList, Text, useDisclosure } from '@chakra-ui/react';
import { HasAccess } from '../../../redux/accessUtils';
import CommonCheckTable from '../../../components/reactTable/checktable';
import { SearchIcon } from "@chakra-ui/icons";
import { CiMenuKebab } from 'react-icons/ci';
import { Link, useNavigate } from 'react-router-dom';
import MeetingAdvanceSearch from './components/MeetingAdvanceSearch';
import AddMeeting from './components/Addmeeting';
import EditMeeting from './components/EditMeeting';
import CommonDeleteModel from 'components/commonDeleteModel';
import { deleteManyApi } from 'services/api';
import { toast } from 'react-toastify';
import { fetchMeetingData } from '../../../redux/slices/meetingSlice';
import { useDispatch, useSelector } from 'react-redux';

const Index = () => {
    const title = "Meeting";
    const navigate = useNavigate();
    const dispatch = useDispatch();
    
    const [action, setAction] = useState(false);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [selectedValues, setSelectedValues] = useState([]);
    const [advanceSearch, setAdvanceSearch] = useState(false);
    const [getTagValuesOutSide, setGetTagValuesOutside] = useState([]);
    const [searchboxOutside, setSearchboxOutside] = useState('');
    const [deleteMany, setDeleteMany] = useState(false);
    const [displaySearchData, setDisplaySearchData] = useState(false);
    const [searchedData, setSearchedData] = useState([]);
    
    // Edit state
    const [edit, setEdit] = useState(false);
    const [selectedId, setSelectedId] = useState(null);
    
    // Get data from Redux store
    const { data, isLoading, error } = useSelector((state) => state.meetingData);
    const [permission] = HasAccess(['Meetings']);

    const actionHeader = {
        Header: "Action", 
        isSortable: false, 
        center: true,
        cell: ({ row }) => (
            <Text fontSize="md" fontWeight="900" textAlign={"center"}>
                <Menu isLazy>
                    <MenuButton><CiMenuKebab /></MenuButton>
                    <MenuList minW={'fit-content'} transform={"translate(1520px, 173px);"}>
                        {permission?.update && (
                            <MenuItem 
                                py={2.5} 
                                icon={<EditIcon fontSize={15} />}
                                onClick={() => { 
                                    setEdit(true); 
                                    setSelectedId(row?.values?._id); 
                                }}
                            >
                                Edit
                            </MenuItem>
                        )}
                        {permission?.view && (
                            <MenuItem 
                                py={2.5} 
                                color={'green'}
                                onClick={() => navigate(`/metting/${row?.values._id}`)}
                                icon={<ViewIcon fontSize={15} />}
                            >
                                View
                            </MenuItem>
                        )}
                        {permission?.delete && (
                            <MenuItem 
                                py={2.5} 
                                color={'red'} 
                                onClick={() => { 
                                    setDeleteMany(true); 
                                    setSelectedValues([row?.values?._id]); 
                                }} 
                                icon={<DeleteIcon fontSize={15} />}
                            >
                                Delete
                            </MenuItem>
                        )}
                    </MenuList>
                </Menu>
            </Text>
        )
    };

    const tableColumns = [
        {
            Header: "#",
            accessor: "_id",
            isSortable: false,
            width: 10
        },
        {
            Header: 'Agenda', 
            accessor: 'agenda', 
            cell: (cell) => (
                <Link to={`/metting/${cell?.row?.values._id}`}> 
                    <Text
                        me="10px"
                        sx={{ '&:hover': { color: 'blue.500', textDecoration: 'underline' } }}
                        color='brand.600'
                        fontSize="sm"
                        fontWeight="700"
                    >
                        {cell?.value || ' - '}
                    </Text>
                </Link>
            )
        },
        { Header: "Date & Time", accessor: "dateTime" },
        { Header: "Time Stamp", accessor: "timestamp" },
        { Header: "Created By", accessor: "createdByName" },
        ...(permission?.update || permission?.view || permission?.delete ? [actionHeader] : [])
    ];

    const fetchData = async () => {
        try {
            const result = await dispatch(fetchMeetingData());
            if (result.payload && result.payload.status === 200) {
                // Data is automatically handled by Redux
                console.log('Meetings fetched successfully');
            } else {
                toast.error("Failed to fetch meetings");
            }
        } catch (error) {
            console.error('Error fetching meetings:', error);
            toast.error("Failed to fetch meetings");
        }
    };

    const handleDeleteMeeting = async (ids) => {
        try {
            let response = await deleteManyApi('api/meeting/deleteMany', ids);
            if (response.status === 200) {
                toast.success('Meeting(s) deleted successfully');
                setSelectedValues([]);
                setDeleteMany(false);
                setAction((pre) => !pre);
            } else {
                toast.error('Failed to delete meeting(s)');
            }
        } catch (error) {
            console.error('Error deleting meetings:', error);
            toast.error('Failed to delete meeting(s)');
        }
    };

    useEffect(() => {
        fetchData();
    }, [action]);

    // Show error message if there's an error
    useEffect(() => {
        if (error) {
            console.error('Meeting data error:', error);
        }
    }, [error]);

    return (
        <div>
            <CommonCheckTable
                title={title}
                isLoding={isLoading}
                columnData={tableColumns ?? []}
                allData={data ?? []}
                tableData={data}
                searchDisplay={displaySearchData}
                setSearchDisplay={setDisplaySearchData}
                searchedDataOut={searchedData}
                setSearchedDataOut={setSearchedData}
                tableCustomFields={[]}
                access={permission}
                onOpen={onOpen}
                selectedValues={selectedValues}
                setSelectedValues={setSelectedValues}
                setDelete={setDeleteMany}
                AdvanceSearch={
                    <Button 
                        variant="outline" 
                        colorScheme='brand' 
                        leftIcon={<SearchIcon />} 
                        mt={{ sm: "5px", md: "0" }} 
                        size="sm" 
                        onClick={() => setAdvanceSearch(true)}
                    >
                        Advance Search
                    </Button>
                }
                getTagValuesOutSide={getTagValuesOutSide}
                searchboxOutside={searchboxOutside}
                setGetTagValuesOutside={setGetTagValuesOutside}
                setSearchboxOutside={setSearchboxOutside}
                handleSearchType="MeetingSearch"
            />

            <MeetingAdvanceSearch
                advanceSearch={advanceSearch}
                setAdvanceSearch={setAdvanceSearch}
                setSearchedData={setSearchedData}
                setDisplaySearchData={setDisplaySearchData}
                allData={data ?? []}
                setAction={setAction}
                setGetTagValues={setGetTagValuesOutside}
                setSearchbox={setSearchboxOutside}
            />
            
            <AddMeeting 
                setAction={setAction} 
                isOpen={isOpen} 
                onClose={onClose} 
            />

            {/* Edit Meeting Modal */}
            {edit && (
                <EditMeeting 
                    setAction={setAction}
                    isOpen={edit}
                    onClose={() => {
                        setEdit(false);
                        setSelectedId(null);
                    }}
                    selectedId={selectedId}
                />
            )}

            {/* Delete model */}
            <CommonDeleteModel 
                isOpen={deleteMany} 
                onClose={() => setDeleteMany(false)} 
                type='Meetings' 
                handleDeleteData={handleDeleteMeeting} 
                ids={selectedValues} 
            />
        </div>
    );
};

export default Index;