import React from 'react';

import { Table, Alert, Radio, Select } from 'antd';
import { RelatedObject, ObjectInfo } from '../lib/model';
import styles from './style.module.css';
import Features from './Features';
import { OntologyReference } from '../../../types/ontology';
import ObjectDetail from './ObjectDetail';
import { SortKey, SortDirection } from './LinkedObjectsDB';
import { RadioChangeEvent } from 'antd/lib/radio';
import { SelectValue } from 'antd/lib/select';

export interface Props {
    linkedObjects: Array<RelatedObject>;
    totalCount: number;
    selectObject: (ref: string) => void;
    selectedObjectRef: string | null;
    termRef: OntologyReference;
    sortObjects: (sortBy: SortKey, direction: SortDirection) => void;
}

interface State {
    selectedObjectInfo: ObjectInfo | null;
}

export default class LinkedObjects extends React.Component<Props, State> {
    currentSortDirection: SortDirection;
    currentSortKey: SortKey;
    constructor(props: Props) {
        super(props);
        this.state = {
            selectedObjectInfo: null
        };
        this.currentSortDirection = 'ascending';
        this.currentSortKey = 'name';
    }
    renderTable() {
        return <Table<RelatedObject>
            dataSource={this.props.linkedObjects}
            className="KBaseAntdOverride-remove-table-border ScrollingFlexTable"
            size="small"
            pagination={false}
            // pagination={{
            //     pageSize: 20
            // }}
            scroll={{ y: '100%' }}
            rowKey={(row: RelatedObject) => {
                return [
                    row.workspaceId,
                    row.id,
                    row.version
                ].join(':');
            }}
            bordered={false}
        >
            <Table.Column
                dataIndex={"name"}
                title="Object Name"
                width="40%"
                render={(name: string, row: RelatedObject) => {
                    const hash = [
                        'dataview',
                        String(row.workspaceId),
                        String(row.id),
                        String(row.version)
                    ].join('/');
                    const url = new URL('', window.location.origin);
                    url.hash = hash;
                    return (
                        <a href={url.toString()} target="_blank" rel="noopener noreferrer">
                            {name}
                        </a>
                    );
                }}
                defaultSortOrder="ascend"
                sorter={(a: RelatedObject, b: RelatedObject) => {
                    return a.name.localeCompare(b.name);
                }}
            />
            <Table.Column
                dataIndex={"workspaceType"}
                title="Type"
                width="40%"
                render={(workspaceType: string, row: RelatedObject) => {
                    const hash = [
                        'spec',
                        'type',
                        workspaceType
                    ].join('/');
                    const url = new URL('', window.location.origin);
                    url.hash = hash;
                    // const search = url.searchParams;
                    // search.set('sub', 'Feature');
                    // search.set('subid', featureID);
                    return (
                        <a href={url.toString()} target="_blank" rel="noopener noreferrer">
                            {workspaceType}
                        </a>
                    );
                }}
                sorter={(a: RelatedObject, b: RelatedObject) => {
                    return a.workspaceType.localeCompare(b.workspaceType);
                }}
            />
            <Table.Column
                dataIndex={"featureCount"}
                width="8em"
                title="# Features"
                render={(featureCount: number) => {
                    const content = Intl.NumberFormat('en-US', {
                        useGrouping: true
                    }).format(featureCount);
                    return <div style={{
                        fontFamily: 'monospace',
                        textAlign: 'right',
                        paddingRight: '2em'
                    }}>
                        {content}
                    </div>;
                }}
                sorter={(a: RelatedObject, b: RelatedObject) => {
                    return a.featureCount - b.featureCount;
                }}
            />

        </Table>;
    }
    /*
                // <Table.Column
            //     dataIndex={"relatedAt"}
            //     width="20%"
            //     title="Linked"
            //     render={(relatedAt: number) => {
            //         return Intl.DateTimeFormat('en-US').format(relatedAt);
            //     }}
            // />
    */
    renderNone() {
        return (
            <Alert type="info"
                message="No Linked Data"
                description={
                    <p>
                        No data objects have yet been associated with this term
                    </p>
                }
                showIcon
                style={{
                    margin: '0 auto',
                    marginTop: '20px'
                }}
            />
        );
    }

    selectObject(object: RelatedObject) {
        const ref = `${object.workspaceId}/${object.id}/${object.version}`;
        this.props.selectObject(ref);
        this.setState({
            selectedObjectInfo: object.info
        });
    }

    renderObjects() {
        return this.props.linkedObjects.map((object) => {
            const ref = `${object.workspaceId}/${object.id}/${object.version}`;
            const classNames: Array<string> = [styles.Object];
            if (this.props.selectedObjectRef === ref) {
                classNames.push(styles.SelectedObject);
            }
            const [, typeName,] = object.workspaceType.split(/[-.]/);
            return <div
                className={classNames.join(' ')}
                key={ref}
                onClick={() => { this.selectObject(object); }}
            >
                <div className={styles.CardNameRow}>
                    <div className={styles.ObjectName}>
                        <a href={`/#dataview/${ref}`} target="_blank" rel="noopener noreferrer">{object.name}</a>
                    </div>
                    <div className={styles.ObjectType}>
                        <a href={`/#spec/type/${object.workspaceType}`} target="_blank" rel="noopener noreferrer">{typeName}</a>
                    </div>
                </div>
                <div className={styles.CardFeaturesRow}>
                    <div className={styles.ObjectFeatures}>
                        {Intl.NumberFormat('en-US', {
                            useGrouping: true
                        }).format(object.featureCount)} features
                    </div>
                </div>
            </div>;
        });
    }

    handleSortChange(value: SelectValue) {
        this.currentSortKey = value.toString() as SortKey;
        this.props.sortObjects(this.currentSortKey, this.currentSortDirection);
    }

    // handleSortDirectionMenu(clickParam: ClickParam) {
    //     this.currentSortDirection = clickParam.key as SortKey;
    //     this.props.sortObjects(this.currentSortKey, this.currentSortDirection);
    // }

    // renderSortDropdown() {
    //     const menu = <Menu
    //         defaultSelectedKeys={['name']}
    //         onClick={this.handleSortMenu.bind(this)}>
    //         <Menu.Item key="name">Name</Menu.Item>
    //         <Menu.Item key="date">Date</Menu.Item>
    //         <Menu.Item key="featureCount"># Features</Menu.Item>
    //     </Menu>;
    //     return <div>
    //         <Dropdown overlay={menu}>
    //             <Button>
    //                 Sort <DownOutlined />
    //             </Button>
    //         </Dropdown>
    //     </div>;
    // }

    renderSortSelect() {
        return <Select
            defaultValue='name'
            dropdownMatchSelectWidth={true}
            style={{ width: '9em' }}
            onChange={this.handleSortChange.bind(this)}
        >
            <Select.Option value="name">Name</Select.Option>
            <Select.Option value="featureCount">Feature Count</Select.Option>
        </Select>;
    }

    handleSortDirectionChange(e: RadioChangeEvent) {
        this.currentSortDirection = e.target.value as SortDirection;
        this.props.sortObjects(this.currentSortKey, this.currentSortDirection);
    }

    renderSortDirectionControl() {
        return <Radio.Group
            defaultValue='ascending'
            onChange={this.handleSortDirectionChange.bind(this)}>
            <Radio value="ascending">Ascending</Radio>
            <Radio value="descending">Descending</Radio>
        </Radio.Group>;
    }

    renderControls() {
        return <div style={{ marginBottom: '6px', textAlign: 'center' }}>
            <span>Sort: </span>
            {this.renderSortSelect()}
            {' '}
            {this.renderSortDirectionControl()}
        </div>;
    }

    renderLinkedObjects() {
        return <>
            <div style={{ flex: '0 0 auto' }}>{this.renderControls()}</div>
            <div style={{ flex: '1 1 0px', overflowY: 'auto' }}>
                {this.renderObjects()}
            </div>
        </>;
    }

    renderFeatures() {
        if (this.props.selectedObjectRef === null) {
            return <Alert
                type="info"
                message={<p>Select an object to show its linked features...</p>}
                style={{ maxWidth: '40em', margin: '10px auto' }}
            />;
        }
        return <Features
            termRef={this.props.termRef}
            objectRef={this.props.selectedObjectRef}
            key={this.props.selectedObjectRef} />;
    }

    renderColumnHeading(title: string) {
        return <div className={styles.ColumnHeading}>
            <div></div>
            <div>{title}</div>
            <div></div>
        </div>;
    }

    renderLayout() {
        return <div className="Col">
            <div className="Row">
                <div className="Col" style={{ marginRight: '5px' }}>
                    <div className="Col Col-auto">
                        {this.renderColumnHeading('Objects')}
                    </div>
                    <div className="Col">
                        {this.renderLinkedObjects()}
                    </div>
                </div>
                <div className="Col Col-grow-2" style={{ marginLeft: '5px' }}>
                    <div className="Col Col-auto">
                        {this.renderColumnHeading('Object Detail')}
                    </div>
                    <div className="Col Col-auto">
                        <ObjectDetail objectInfo={this.state.selectedObjectInfo} />

                    </div>
                    <div className="Col Col-auto" style={{ marginTop: '20px' }}>
                        {this.renderColumnHeading('Features')}
                    </div>
                    <div className="Col Col scrolling">
                        {this.renderFeatures()}
                    </div>
                </div>
            </div>
        </div>;
    }

    render() {
        if (this.props.linkedObjects.length === 0) {
            return this.renderNone();
        }
        return this.renderLayout();
    }
}